import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, BookHeart, SkipForward, Wand2 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '../components/site/Site'
import Generating from '../components/site/Generating'
import ItemList from '../components/memory/ItemList'
import PhotoStudio from '../components/memory/PhotoStudio'
import type { DraftPhoto } from '../components/memory/PhotoStudio'
import TemplatePicker from '../components/book/TemplatePicker'
import { ApiError, generateMemory } from '../api'
import type { MemoryRequestBody } from '../api'
import { navigate } from '../lib/router'
import { useLibrary } from '../lib/library'
import { deleteBlobs, getBlobs } from '../lib/db'
import type { BlobRec } from '../lib/db'
import { bookFromMemory } from '../lib/books'
import type { Book, CollageLayout, LayoutSection, MemoryData, MemoryInput, MemoryText, TemplateId } from '../lib/books'
import { plainMemoryText } from '../templates/content'
import { DEFAULT_TEMPLATE } from '../templates/registry'

type Row = Record<string, string>
const blankPlace = (): Row => ({ name: '', day: '', note: '' })
const blankAct = (): Row => ({ text: '', day: '' })
const blankFood = (): Row => ({ name: '', note: '' })
const blankLine = (): Row => ({ text: '' })

const QUESTIONS = [
  { id: 'where', title: 'Where did you go?', hint: 'The place this book is about.', optional: false },
  { id: 'when', title: 'When, and for how long?', hint: 'A month, a season or exact dates — whatever you remember.', optional: true },
  { id: 'who', title: 'Who came along?', hint: 'Friends, family, or just you. Skip it if you like.', optional: true },
  { id: 'places', title: 'Which places did you visit?', hint: 'Add each place. A day number and a few words are optional, but they help us arrange your pages.', optional: false },
  { id: 'did', title: 'What did you get up to?', hint: 'Things you did — a hike, a boat ride, a cooking class.', optional: true },
  { id: 'food', title: 'What did you eat and drink?', hint: 'Favourite restaurants, cafés, street food, a dish you still think about.', optional: true },
  { id: 'moments', title: 'What were your favourite moments?', hint: 'Short and sweet is perfect. Only what really happened.', optional: true },
  { id: 'exp', title: 'Anything unforgettable?', hint: 'Memorable experiences and anything else you want in the book, in your own words.', optional: true },
] as const
const PHOTO_STEP = QUESTIONS.length
const STYLE_STEP = QUESTIONS.length + 1
const REVIEW_STEP = QUESTIONS.length + 2

const clean = (s: string) => s.trim().replace(/\s+/g, ' ')

export default function Memories() {
  const lib = useLibrary()
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const fromId = params.get('from')
  const editId = params.get('edit')
  const fromPlan = fromId ? lib.books.find((b) => b.id === fromId && b.plan) : undefined
  const editing = editId ? lib.books.find((b) => b.id === editId && b.memory) : undefined

  const [step, setStep] = useState(0)
  const [destination, setDestination] = useState('')
  const [dates, setDates] = useState('')
  const [days, setDays] = useState<number | ''>('')
  const [companions, setCompanions] = useState<string[]>([])
  const [companionDraft, setCompanionDraft] = useState('')
  const [places, setPlaces] = useState<Row[]>([blankPlace()])
  const [acts, setActs] = useState<Row[]>([blankAct()])
  const [food, setFood] = useState<Row[]>([blankFood()])
  const [moments, setMoments] = useState<Row[]>([blankLine()])
  const [exps, setExps] = useState<Row[]>([blankLine()])
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<DraftPhoto[]>([])
  const [layouts, setLayouts] = useState<Partial<Record<LayoutSection, CollageLayout>>>({})
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE)
  const [err, setErr] = useState<string | null>(null)
  const [apiErr, setApiErr] = useState<ApiError | null>(null)
  const [busy, setBusy] = useState(false)
  const ctrl = useRef<AbortController | null>(null)
  const seeded = useRef(false)
  const removedBlobs = useRef<string[]>([])

  // Seed once the library has loaded: from a plan (basics ONLY) or from an existing memory book (everything).
  useEffect(() => {
    if (!lib.ready || seeded.current) return
    if (editId && !editing) return
    seeded.current = true
    if (editing?.memory) {
      const m = editing.memory, i = m.input
      setDestination(i.destination); setDates(i.dates ?? ''); setDays(i.days ?? ''); setCompanions(i.companions)
      setPlaces(i.places.length ? i.places.map((p) => ({ name: p.name, day: p.day ? String(p.day) : '', note: p.note ?? '' })) : [blankPlace()])
      setActs(i.activities.length ? i.activities.map((a) => ({ text: a.text, day: a.day ? String(a.day) : '' })) : [blankAct()])
      setFood(i.food.length ? i.food.map((f) => ({ name: f.name, note: f.note ?? '' })) : [blankFood()])
      setMoments(i.moments.length ? i.moments.map((t) => ({ text: t })) : [blankLine()])
      setExps(i.experiences.length ? i.experiences.map((t) => ({ text: t })) : [blankLine()])
      setNotes(i.notes ?? ''); setLayouts(m.layouts); setTemplate(editing.templateId)
      getBlobs(editing.id).then((bs) => {
        setPhotos(m.photos.map((meta) => { const b = bs.find((x) => x.id === meta.id); return b ? { meta, original: b.original, display: b.display, url: URL.createObjectURL(b.display), isNew: false } : null }).filter((x): x is DraftPhoto => !!x))
      }).catch(() => undefined)
    } else if (fromPlan?.plan) {
      // Deliberately NOT the itinerary: only the basics are carried over. The traveller tells us what really happened.
      setDestination(fromPlan.plan.journal.destination); setDays(fromPlan.plan.trip.days); setDates(fromPlan.plan.trip.travel_dates ?? ''); setTemplate(fromPlan.templateId)
    }
  }, [lib.ready, editId, editing, fromPlan])

  const input = (): MemoryInput => {
    const seen = new Set<string>()
    const pl = places.map((p) => ({ name: clean(p.name), day: Number(p.day) || undefined, note: clean(p.note ?? '') || undefined })).filter((p) => p.name && !seen.has(p.name.toLowerCase()) && seen.add(p.name.toLowerCase()))
    const fseen = new Set<string>()
    const fd = food.map((f) => ({ name: clean(f.name), note: clean(f.note ?? '') || undefined })).filter((f) => f.name && !fseen.has(f.name.toLowerCase()) && fseen.add(f.name.toLowerCase()))
    return {
      destination: clean(destination), dates: clean(dates) || undefined, days: days === '' ? undefined : Number(days), companions: companions.map(clean).filter(Boolean),
      places: pl, activities: acts.map((a) => ({ text: clean(a.text), day: Number(a.day) || undefined })).filter((a) => a.text), food: fd,
      moments: moments.map((m) => clean(m.text)).filter(Boolean), experiences: exps.map((m) => clean(m.text)).filter(Boolean), notes: clean(notes) || undefined,
    }
  }
  const live = input()

  function validate(s: number): string | null {
    if (s === 0 && (clean(destination).length < 2 || !/\p{L}/u.test(destination))) return 'Please tell us where you went (at least 2 letters).'
    if (s === 1 && days !== '' && (!Number.isInteger(Number(days)) || Number(days) < 1 || Number(days) > 60)) return 'Number of days should be between 1 and 60 — or leave it blank.'
    if (s === 3 && live.places.length < 1) return 'Add at least one place you visited — it is the heart of the book.'
    return null
  }
  const go = (s: number) => { setErr(null); setStep(Math.max(0, Math.min(REVIEW_STEP, s))); window.scrollTo({ top: 0 }) }
  const next = () => { const e = validate(step); if (e) { setErr(e); return } go(step + 1) }

  const addCompanion = () => { const v = clean(companionDraft); if (v && !companions.includes(v) && companions.length < 12) setCompanions([...companions, v]); setCompanionDraft('') }

  async function generate(useAi: boolean) {
    if (busy) return
    for (const s of [0, 1, 3]) { const e = validate(s); if (e) { setStep(s); setErr(e); return } }
    const inp = input()
    setBusy(true); setApiErr(null); setErr(null)
    ctrl.current = new AbortController()
    try {
      let text: MemoryText
      if (useAi) {
        const body: MemoryRequestBody = {
          ...inp, photos: photos.map((p) => ({ id: p.meta.id, caption: p.meta.caption || undefined, section: p.meta.section, place: p.meta.place, day: p.meta.day })),
        }
        text = (await generateMemory(body, ctrl.current.signal)).memory
      } else text = plainMemoryText(inp)
      const metas = photos.map((p, i) => ({ ...p.meta, order: i }))
      const data: MemoryData = { input: inp, text, photos: metas, layouts, aiWritten: useAi }
      const fresh = bookFromMemory(data, template, fromPlan?.id)
      const merged: Book = editing ? { ...editing, templateId: template, title: text.title, destination: inp.destination, datesLabel: fresh.datesLabel, memory: data } : fresh
      const blobs: BlobRec[] = photos.map((p) => ({ id: p.meta.id, bookId: merged.id, original: p.original, display: p.display }))
      await lib.save(merged, blobs)
      if (editing) {
        const keep = new Set(photos.map((p) => p.meta.id))
        const gone = (await getBlobs(editing.id)).map((b) => b.id).filter((id) => !keep.has(id))
        await deleteBlobs(gone)
      }
      if (fromPlan && !editing) await lib.save({ ...fromPlan, status: 'completed', memoryBookId: merged.id })
      navigate(`/book/${merged.id}`)
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
      if (e instanceof ApiError) setApiErr(e)
      else setErr('We could not save the book in this browser (storage may be full or blocked). Try removing a few photographs.')
    } finally { setBusy(false) }
  }

  const total = QUESTIONS.length
  const q = QUESTIONS[step]
  const heroLine = editing ? 'Edit your memories' : fromPlan ? 'You made it! Now tell us what really happened.' : 'Turn your memories into a travel book'

  return (
    <div className="min-h-screen">
      <div className="paper-bg">
        <SiteHeader showStart={false} />
        <main className="mx-auto max-w-3xl px-5 pb-20 pt-2 md:px-6">
          <p className="eyebrow mb-3 flex items-center gap-2"><BookHeart size={15} aria-hidden /> {heroLine}</p>
          {fromPlan && !editing && (
            <p className="mb-5 rounded border-2 border-mustard bg-[#fbf0cf] px-4 py-3 text-[0.95rem] text-[#5b4308]">We only carried over the destination{fromPlan.plan?.trip.travel_dates ? ', dates' : ''} and length of your plan. Your original itinerary is untouched and is <strong>not</strong> reused — add the places and moments you actually experienced.</p>
          )}
          <div className="wiz-bar mb-6" aria-label={step < total ? `Question ${step + 1} of ${total}` : 'Almost done'} role="img">
            {Array.from({ length: total + 2 }, (_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
          </div>

          <section className="fpass" aria-live="polite" data-step={step}>
            <div className="fpass-head flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-8">
              <span className="font-type text-sm uppercase tracking-[.22em] text-ink">
                {step < total ? `Question ${step + 1} of ${total}` : step === PHOTO_STEP ? 'Your photographs' : step === STYLE_STEP ? 'Choose a style' : 'Ready to bind'}
              </span>
              <span className="font-type text-xs uppercase tracking-[.2em] text-maroon">{q && q.optional ? 'optional — skip if you like' : step < total ? 'required' : step === PHOTO_STEP ? 'the best part' : ''}</span>
            </div>
            <div className="grid gap-6 px-6 py-7 md:px-8">
              {q && <div><h1 className="wiz-q text-ink">{q.title}</h1><p className="mt-2 text-lg text-ink/75">{q.hint}</p></div>}

              {step === 0 && (
                <div><label className="field-label" htmlFor="m-dest">Destination <span className="req" aria-hidden>*</span></label>
                  <input id="m-dest" className="input" autoFocus value={destination} maxLength={100} placeholder="Lisbon, Hampi, Banff…" onChange={(e) => setDestination(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && next()} aria-invalid={!!err} /></div>
              )}
              {step === 1 && (
                <div className="grid gap-5 md:grid-cols-[1fr_160px]">
                  <div><label className="field-label" htmlFor="m-dates">Month or dates</label><input id="m-dates" className="input" value={dates} maxLength={60} placeholder="e.g. June 2025, or 3–9 Oct" onChange={(e) => setDates(e.target.value)} /></div>
                  <div><label className="field-label" htmlFor="m-days">Number of days</label><input id="m-days" className="input" type="number" min={1} max={60} value={days} placeholder="e.g. 5" onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))} /></div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className="field-label" htmlFor="m-who">Add a name</label>
                  <div className="flex gap-2"><input id="m-who" className="input" value={companionDraft} maxLength={40} placeholder="e.g. Asha" onChange={(e) => setCompanionDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompanion() } }} /><button type="button" className="btn btn-ghost btn-sm" onClick={addCompanion}>Add</button></div>
                  {companions.length > 0 && <ul className="mt-3 flex flex-wrap gap-2" aria-label="People who travelled">{companions.map((c) => <li key={c}><button type="button" className="fchip" aria-label={`Remove ${c}`} onClick={() => setCompanions(companions.filter((x) => x !== c))}>{c} ✕</button></li>)}</ul>}
                </div>
              )}
              {step === 3 && <ItemList id="pl" rows={places} onChange={setPlaces} addLabel="Add a place" empty={blankPlace()} fields={[{ key: 'name', label: 'Place', placeholder: 'Place (e.g. Alfama)' }, { key: 'day', label: 'Day', placeholder: 'Day', width: 'narrow', type: 'number' }, { key: 'note', label: 'Note', placeholder: 'A few words about it (optional)', max: 300 }]} />}
              {step === 4 && <ItemList id="ac" rows={acts} onChange={setActs} addLabel="Add an activity" empty={blankAct()} fields={[{ key: 'text', label: 'Activity', placeholder: 'e.g. Rode tram 28 end to end', max: 200 }, { key: 'day', label: 'Day', placeholder: 'Day', width: 'narrow', type: 'number' }]} />}
              {step === 5 && <ItemList id="fd" rows={food} onChange={setFood} addLabel="Add food or a café" empty={blankFood()} fields={[{ key: 'name', label: 'Food or place', placeholder: 'e.g. Pastéis de Belém' }, { key: 'note', label: 'Note', placeholder: 'What you remember (optional)', max: 300 }]} />}
              {step === 6 && <ItemList id="mo" rows={moments} onChange={setMoments} addLabel="Add a moment" empty={blankLine()} fields={[{ key: 'text', label: 'Moment', placeholder: 'e.g. Sunset at the miradouro', max: 300 }]} />}
              {step === 7 && (
                <div className="grid gap-5">
                  <ItemList id="ex" rows={exps} onChange={setExps} addLabel="Add an experience" empty={blankLine()} fields={[{ key: 'text', label: 'Experience', placeholder: 'e.g. The fado night in Alfama', max: 300 }]} />
                  <div><label className="field-label" htmlFor="m-notes">Anything else you want to say? <span className="field-opt">{notes.length}/1500</span></label><textarea id="m-notes" className="input" rows={4} maxLength={1500} value={notes} placeholder="A note to your future self…" onChange={(e) => setNotes(e.target.value)} /></div>
                </div>
              )}

              {step === PHOTO_STEP && (
                <div>
                  <h1 className="wiz-q text-ink">Add your photographs</h1>
                  <p className="mb-5 mt-2 text-lg text-ink/75">Your own photos are the stars of the book. Add captions, choose which page each one belongs on — or let us place them from what you wrote. You can skip this and add them later.</p>
                  <PhotoStudio photos={photos} setPhotos={(fn) => setPhotos(fn)} input={live} layouts={layouts} setLayouts={setLayouts} />
                </div>
              )}
              {step === STYLE_STEP && (
                <div><h1 className="wiz-q text-ink">Pick a style</h1><p className="mb-5 mt-2 text-lg text-ink/75">The same memories, five different books. You can change it again at any time.</p><TemplatePicker value={template} onChange={setTemplate} kind="memory" /></div>
              )}
              {step === REVIEW_STEP && (
                <div>
                  <h1 className="wiz-q text-ink">Ready to bind your book</h1>
                  <ul className="mt-4 grid gap-1.5 text-lg" data-testid="review">
                    <li><b>{live.destination || '—'}</b>{live.dates ? ` · ${live.dates}` : ''}{live.days ? ` · ${live.days} ${live.days === 1 ? 'day' : 'days'}` : ''}</li>
                    {live.companions.length > 0 && <li>With {live.companions.join(', ')}</li>}
                    <li>{live.places.length} place{live.places.length === 1 ? '' : 's'} · {live.food.length} food &amp; café{live.food.length === 1 ? '' : 's'} · {live.activities.length} activit{live.activities.length === 1 ? 'y' : 'ies'}</li>
                    <li>{live.moments.length + live.experiences.length} moment{live.moments.length + live.experiences.length === 1 ? '' : 's'} &amp; experiences · {photos.length} photograph{photos.length === 1 ? '' : 's'}</li>
                  </ul>
                  <p className="mt-4 text-[0.95rem] text-ink/70">Gemini will write the captions and intro from <em>only</em> what you told us (one request, no photos sent). Anything you left blank stays blank — nothing is invented. Your photographs never leave this browser.</p>
                </div>
              )}

              {err && <p role="alert" className="rounded border-2 border-coral bg-[#fde8e4] px-4 py-3 text-[0.95rem] text-[#7a1d14]">{err}</p>}
              {apiErr && (
                <div role="alert" className="rounded border-2 border-coral bg-[#fde8e4] px-4 py-3 text-[0.95rem] text-[#7a1d14]">
                  <p className="flex gap-2"><AlertTriangle size={18} aria-hidden /> <strong>The AI could not finish your book.</strong></p>
                  <p className="mt-1">{apiErr.message}</p>
                  <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => generate(false)}>Build it from my own words instead (no AI)</button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-ink/40 pt-6">
                {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)} disabled={busy}><ArrowLeft size={18} aria-hidden /> Back</button>}
                {step < REVIEW_STEP && <button type="button" className="btn btn-primary" onClick={next}>{step === PHOTO_STEP && photos.length === 0 ? 'Skip photos for now' : step < total ? 'Next' : 'Continue'} <ArrowRight size={18} aria-hidden /></button>}
                {q?.optional && <button type="button" className="btn btn-ghost" onClick={() => go(step + 1)}><SkipForward size={16} aria-hidden /> Skip this one</button>}
                {step === REVIEW_STEP && <button type="button" className="btn btn-primary" onClick={() => generate(true)} disabled={busy}><Wand2 size={18} aria-hidden /> Create my memory book</button>}
              </div>
            </div>
          </section>
          {!lib.persistent && <p className="mt-4 rounded border-2 border-mustard bg-[#fbf0cf] px-4 py-3 text-sm text-[#5b4308]">Your browser is not allowing local storage (private window?). The book will work during this visit but will be lost when you close the tab.</p>}
        </main>
      </div>
      <SiteFooter />
      {busy && <Generating mode="memory" destination={clean(destination)} days={Number(days) || 3} onCancel={() => { ctrl.current?.abort(); setBusy(false) }} />}
    </div>
  )
}
