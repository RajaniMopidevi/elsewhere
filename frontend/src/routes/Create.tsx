import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, KeyRound, Minus, Plus, Wand2 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '../components/site/Site'
import Generating from '../components/site/Generating'
import { Illo } from '../components/scrap/Illustrations'
import { Tape } from '../components/scrap/Decor'
import { ApiError, checkHealth, generateJournal } from '../api'
import { navigate } from '../lib/router'
import { useStore } from '../store'
import { useLibrary } from '../lib/library'
import { bookFromPlan } from '../lib/books'
import type { TemplateId } from '../lib/books'
import { DEFAULT_TEMPLATE } from '../templates/registry'
import TemplatePicker from '../components/book/TemplatePicker'
import type { TripRequest } from '../types'

export const INTERESTS = [
  'Architecture', 'History', 'Culture', 'Food', 'Cafés', 'Shopping',
  'Nature', 'Adventure', 'Photography', 'Art', 'Hidden gems', 'Local experiences',
]
const BUDGETS = ['Budget-friendly', 'Mid-range', 'Treat yourself']
const STAYS = ['Hostel', 'Guesthouse', 'Boutique hotel', 'Hotel', 'Apartment', 'Resort']
const STYLES = ['Slow & relaxed', 'Balanced', 'Packed & active', 'Adventurous', 'Romantic', 'Family-friendly']

type Errors = Partial<Record<'destination' | 'days' | 'travellers' | 'form', string>>

export function validate(destination: string, days: number | '', travellers: number | ''): Errors {
  const e: Errors = {}
  const d = destination.trim()
  if (d.length < 2) e.destination = 'Please tell us where you want to go (at least 2 letters).'
  else if (!/\p{L}/u.test(d)) e.destination = 'The destination needs to contain letters.'
  if (days === '' || !Number.isInteger(days) || days < 1 || days > 14) e.days = 'Choose between 1 and 14 days.'
  if (travellers !== '' && (!Number.isInteger(travellers) || travellers < 1 || travellers > 20)) e.travellers = 'Between 1 and 20 travellers, or leave blank.'
  return e
}

export default function Create() {
  const { draft, setResult, setDraft } = useStore()
  const lib = useLibrary()
  const [step, setStep] = useState<'details' | 'style'>('details')
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE)
  const [destination, setDestination] = useState(draft?.destination ?? '')
  const [days, setDays] = useState<number | ''>(draft?.days ?? 3)
  const [startLocation, setStartLocation] = useState(draft?.start_location ?? '')
  const [dates, setDates] = useState(draft?.travel_dates ?? '')
  const [travellers, setTravellers] = useState<number | ''>(draft?.travellers ?? '')
  const [budget, setBudget] = useState(draft?.budget ?? '')
  const [interests, setInterests] = useState<string[]>(draft?.interests ?? [])
  const [stay, setStay] = useState(draft?.accommodation ?? '')
  const [style, setStyle] = useState(draft?.travel_style ?? '')
  const [notes, setNotes] = useState(draft?.notes ?? '')

  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState<ApiError | null>(null)
  const [health, setHealth] = useState<{ ok: boolean; keyConfigured: boolean } | null>(null)
  const ctrl = useRef<AbortController | null>(null)
  const destRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkHealth().then(setHealth)
    return () => ctrl.current?.abort()
  }, [])

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const pick = (cur: string, v: string, set: (s: string) => void) => set(cur === v ? '' : v)

  const buildTrip = (): TripRequest => {
    const t: TripRequest = { destination: destination.trim(), days: Number(days), interests }
    if (startLocation.trim()) t.start_location = startLocation.trim()
    if (dates.trim()) t.travel_dates = dates.trim()
    if (travellers !== '') t.travellers = Number(travellers)
    if (budget) t.budget = budget
    if (stay) t.accommodation = stay
    if (style) t.travel_style = style
    if (notes.trim()) t.notes = notes.trim()
    return t
  }

  /** Step 1 → step 2: validate the details, then let the traveller pick a style BEFORE anything is generated. */
  function toStyle(e?: FormEvent) {
    e?.preventDefault()
    const errs = validate(destination, days, travellers)
    setErrors(errs)
    setServerError(null)
    if (Object.keys(errs).length) {
      const first = errs.destination ? destRef.current : document.getElementById('days')
      first?.focus()
      return
    }
    setDraft(buildTrip())
    setStep('style')
    window.scrollTo({ top: 0 })
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (busy) return
    const errs = validate(destination, days, travellers)
    setErrors(errs)
    setServerError(null)
    if (Object.keys(errs).length) {
      const first = errs.destination ? destRef.current : document.getElementById('days')
      first?.focus()
      return
    }
    const trip = buildTrip()
    setDraft(trip)
    setBusy(true)
    ctrl.current = new AbortController()
    try {
      const res = await generateJournal(trip, ctrl.current.signal)
      setResult(res)
      const book = bookFromPlan(res, template)
      try { await lib.save(book) } catch { /* storage full or blocked: the journal is still shown for this session */ }
      navigate(`/book/${book.id}`)
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      const api = err instanceof ApiError ? err : new ApiError('Something unexpected went wrong. Please try again.', 'error', 0)
      if (api.code === 'validation' && api.fields) {
        setErrors({
          destination: api.fields.destination,
          days: api.fields.days,
          travellers: api.fields.travellers,
        })
      }
      setServerError(api)
      if (api.code === 'validation') setStep('details')
      checkHealth().then(setHealth)
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => {
    ctrl.current?.abort()
    setBusy(false)
  }

  const setDaysClamped = (n: number) => setDays(Math.max(1, Math.min(14, n)))

  return (
    <div className="min-h-screen">
      <div className="paper-bg">
        <SiteHeader showStart={false} />
        <main className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-5 pb-20 pt-2 md:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          {/* ---------- left: invitation ---------- */}
          <aside className="relative z-10 lg:sticky lg:top-6 lg:self-start" hidden={step === 'style'}>
            <p className="eyebrow mb-4">chapter one · the details</p>
            <h1 className="font-display text-5xl leading-[1.02] text-ink md:text-6xl">
              Where to,<br /><span className="hl-red">wanderer</span>?
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/80">
              Only a destination and a number of days are required. Everything else just helps us make the journal feel like yours.
            </p>
            <div className="relative mt-8 hidden max-w-sm lg:block" aria-hidden>
              <div className="lp-card relative p-5 pt-7" style={{ transform: 'rotate(-2deg)' }}>
                <Tape style={{ left: 120, top: -14 }} />
                <p className="font-type text-xs uppercase tracking-[.2em] text-maroon">inside your journal</p>
                <ul className="mt-3 space-y-1.5 font-hand text-[1.45rem] font-bold leading-tight text-ink">
                  {['a personal cover', 'the destination, in a nutshell', 'an illustrated route map', 'places to explore', 'food & cafés', 'where to stay', 'one page per day', 'travel notes, to scribble on'].map((t) => (
                    <li key={t} className="flex items-center gap-2"><Check size={16} className="text-coral" strokeWidth={3} />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="t-greige stk absolute -right-6 -top-8 h-20 w-20" style={{ position: 'absolute', transform: 'rotate(8deg)' }}><Illo name="plane" /></div>
            </div>
          </aside>

          {/* ---------- right: the pass ---------- */}
          <form className="fpass relative z-10" onSubmit={step === 'details' ? toStyle : submit} noValidate aria-describedby="form-help" hidden={step === 'style'}>
            <div className="fpass-head flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-8">
              <span className="font-type text-sm uppercase tracking-[.22em] text-ink">Trip details</span>
              <span className="font-type text-xs uppercase tracking-[.2em] text-maroon">boarding pass № {String((destination.length * 137 + Number(days || 0) * 11) % 9000 + 1000)}</span>
            </div>

            <div className="grid gap-7 px-6 py-7 md:px-8">
              {health && !health.ok && (
                <Notice tone="warn" icon={<AlertTriangle size={18} />}>
                  The backend is not responding. Start it with <code>uvicorn app.main:app --reload --port 8000</code> inside <code>backend/</code> (see the README).
                </Notice>
              )}
              {health?.ok && !health.keyConfigured && (
                <Notice tone="warn" icon={<KeyRound size={18} />}>
                  The backend is running but no Gemini API key is configured. Add <code>GEMINI_API_KEY</code> to <code>backend/.env</code> and restart it.
                </Notice>
              )}
              <p id="form-help" className="sr-only">Fields marked required must be filled in. All other fields are optional.</p>

              <div className="grid gap-7 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="field-label" htmlFor="destination">Destination <span className="req" aria-hidden>*</span><span className="sr-only">(required)</span></label>
                  <input
                    id="destination" ref={destRef} className="input" value={destination} maxLength={100} autoComplete="off"
                    placeholder="Kyoto, Lisbon, Bali, Amsterdam…"
                    aria-required="true" aria-invalid={!!errors.destination} aria-describedby={errors.destination ? 'destination-err' : undefined}
                    onChange={(e) => { setDestination(e.target.value); if (errors.destination) setErrors({ ...errors, destination: undefined }) }}
                  />
                  {errors.destination && <p id="destination-err" role="alert" className="field-err">{errors.destination}</p>}
                </div>
                <div>
                  <label className="field-label" htmlFor="days">Days <span className="req" aria-hidden>*</span><span className="sr-only">(required)</span></label>
                  <div className="stepper" role="group" aria-label="Number of travel days">
                    <button type="button" aria-label="One day fewer" disabled={days === '' || days <= 1} onClick={() => setDaysClamped(Number(days || 2) - 1)}><Minus size={18} /></button>
                    <input
                      id="days" type="number" inputMode="numeric" min={1} max={14} value={days}
                      aria-required="true" aria-invalid={!!errors.days} aria-describedby={errors.days ? 'days-err' : undefined}
                      onChange={(e) => { setDays(e.target.value === '' ? '' : Number(e.target.value)); if (errors.days) setErrors({ ...errors, days: undefined }) }}
                    />
                    <button type="button" aria-label="One day more" disabled={days !== '' && days >= 14} onClick={() => setDaysClamped(Number(days || 0) + 1)}><Plus size={18} /></button>
                  </div>
                  {errors.days && <p id="days-err" role="alert" className="field-err">{errors.days}</p>}
                </div>
              </div>

              <fieldset className="m-0 border-0 p-0">
                <legend className="field-label">What do you love? <span className="field-opt">pick as many as you like</span></legend>
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Travel interests">
                  {INTERESTS.map((i) => (
                    <button key={i} type="button" className="fchip" aria-pressed={interests.includes(i)} onClick={() => setInterests(toggle(interests, i))}>
                      {interests.includes(i) && <Check size={14} strokeWidth={3} aria-hidden />}{i}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-7 md:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="start">Starting from <span className="field-opt">optional</span></label>
                  <input id="start" className="input" value={startLocation} maxLength={100} placeholder="e.g. Mumbai" onChange={(e) => setStartLocation(e.target.value)} />
                </div>
                <div>
                  <label className="field-label" htmlFor="dates">Month or dates <span className="field-opt">optional</span></label>
                  <input id="dates" className="input" value={dates} maxLength={60} placeholder="e.g. late November" onChange={(e) => setDates(e.target.value)} />
                </div>
                <div>
                  <label className="field-label" htmlFor="travellers">Travellers <span className="field-opt">optional</span></label>
                  <input
                    id="travellers" className="input" type="number" inputMode="numeric" min={1} max={20} value={travellers} placeholder="e.g. 2"
                    aria-invalid={!!errors.travellers} aria-describedby={errors.travellers ? 'trav-err' : undefined}
                    onChange={(e) => { setTravellers(e.target.value === '' ? '' : Number(e.target.value)); if (errors.travellers) setErrors({ ...errors, travellers: undefined }) }}
                  />
                  {errors.travellers && <p id="trav-err" role="alert" className="field-err">{errors.travellers}</p>}
                </div>
                <ChipGroup label="Budget" options={BUDGETS} value={budget} onPick={(v) => pick(budget, v, setBudget)} />
              </div>

              <ChipGroup label="Where you'd like to stay" options={STAYS} value={stay} onPick={(v) => pick(stay, v, setStay)} />
              <ChipGroup label="Travel style" options={STYLES} value={style} onPick={(v) => pick(style, v, setStyle)} />

              <div>
                <label className="field-label" htmlFor="notes">Anything else? <span className="field-opt">optional · {notes.length}/500</span></label>
                <textarea
                  id="notes" className="input" rows={3} maxLength={500} value={notes}
                  placeholder="Travelling with a toddler, vegetarian, love street art, hate early mornings…"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {serverError && (
                <Notice tone="error" icon={<AlertTriangle size={18} />}>
                  <strong className="block">We could not finish your journal.</strong>
                  {serverError.message}
                </Notice>
              )}

              <div className="flex flex-wrap items-center gap-4 border-t-2 border-dashed border-ink/40 pt-6">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  Next: choose a style <ArrowRight size={18} aria-hidden />
                </button>
                <p className="note-hand text-[1.4rem] text-maroon">step 1 of 2 · nothing is generated yet</p>
              </div>
            </div>
          </form>

          {step === 'style' && (
            <section className="fpass relative z-10 lg:col-span-2" style={{ gridColumn: '1 / -1' }} aria-label="Choose a style">
              <div className="fpass-head flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-8">
                <span className="font-type text-sm uppercase tracking-[.22em] text-ink">Choose a style</span>
                <span className="font-type text-xs uppercase tracking-[.2em] text-maroon">step 2 of 2 · {destination.trim()} · {days} {Number(days) === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="grid gap-6 px-6 py-7 md:px-8">
                <TemplatePicker value={template} onChange={setTemplate} kind="plan" />
                {serverError && (
                  <Notice tone="error" icon={<AlertTriangle size={18} />}>
                    <strong className="block">We could not finish your journal.</strong>{serverError.message}
                  </Notice>
                )}
                <div className="flex flex-wrap items-center gap-4 border-t-2 border-dashed border-ink/40 pt-6">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep('details')} disabled={busy}><ArrowLeft size={18} aria-hidden /> Back to details</button>
                  <button type="button" className="btn btn-primary" onClick={() => submit()} disabled={busy}><Wand2 size={18} aria-hidden /> Generate my travel journal</button>
                  <p className="note-hand text-[1.4rem] text-maroon">{serverError ? 'press again to retry' : 'takes under a minute'}</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
      <SiteFooter />
      {busy && <Generating destination={destination.trim()} days={Number(days)} onCancel={cancel} />}
    </div>
  )
}

function ChipGroup({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="field-label">{label} <span className="field-opt">optional</span></legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => (
          <button key={o} type="button" className="fchip" aria-pressed={value === o} onClick={() => onPick(o)}>
            {value === o && <Check size={14} strokeWidth={3} aria-hidden />}{o}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Notice({ tone, icon, children }: { tone: 'warn' | 'error'; icon: React.ReactNode; children: React.ReactNode }) {
  const color = tone === 'error' ? 'border-coral bg-[#fde8e4] text-[#7a1d14]' : 'border-mustard bg-[#fbf0cf] text-[#5b4308]'
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded border-2 px-4 py-3 text-[0.95rem] leading-snug ${color}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="[&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:font-type [&_code]:text-[0.85em]">{children}</div>
    </div>
  )
}
