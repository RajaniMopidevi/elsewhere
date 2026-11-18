import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, BookCheck, ChevronLeft, ChevronRight, Download, LayoutGrid, Loader2, Palette, Pencil, RefreshCw, Save, X } from 'lucide-react'
import { Link } from '../lib/router'
import { ApiError, generateJournal } from '../api'
import { SAMPLE } from '../data/sample'
import { useLibrary } from '../lib/library'
import { getBlobs } from '../lib/db'
import type { BlobRec } from '../lib/db'
import { memoryDatesLabel, planDatesLabel } from '../lib/books'
import type { Book, TemplateId } from '../lib/books'
import { useBlobUrls } from '../lib/images'
import { usePhotos } from '../lib/usePhotos'
import { printJournal } from '../lib/print'
import { templateInfo } from '../templates/registry'
import { useBookPages } from '../components/book/BookRenderer'
import { StyleSwitcher } from '../components/book/TemplatePicker'
import { FitPage } from '../components/scrap/ScaledPage'
import PrintRoot from '../components/PrintRoot'
import Generating from '../components/site/Generating'
import { Wordmark } from '../components/site/Site'

const SAMPLE_BOOK: Book = { id: 'sample', kind: 'plan', status: 'upcoming', templateId: 'vintage', title: SAMPLE.journal.title, destination: SAMPLE.journal.destination, datesLabel: planDatesLabel(SAMPLE.trip), createdAt: '', updatedAt: '', plan: SAMPLE }

export default function BookView({ id, sample }: { id?: string; sample?: boolean }) {
  const lib = useLibrary()
  const [sampleStyle, setSampleStyle] = useState<TemplateId>('vintage')
  if (sample) return <Viewer book={{ ...SAMPLE_BOOK, templateId: sampleStyle }} isSample onStyle={setSampleStyle} />
  if (!lib.ready) return <Centered><p className="font-type uppercase tracking-widest text-ink/70">opening your shelf…</p></Centered>
  const book = lib.books.find((b) => b.id === id)
  if (!book) {
    return (
      <Centered>
        <Wordmark />
        <h1 className="mt-5 font-display text-4xl text-ink">That book isn’t on your shelf</h1>
        <p className="mt-3 text-lg text-ink/75">It may have been deleted, or it was saved in a different browser. Books are stored only in the browser where they were made.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/collection" className="btn btn-primary">My Travel Collection</Link><Link to="/create" className="btn btn-ghost">Create a journal</Link></div>
      </Centered>
    )
  }
  return <SavedViewer key={book.id} book={book} />
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="paper-bg grid min-h-screen place-items-center px-5 py-16"><div className="lp-card max-w-lg p-8 text-center">{children}</div></div>
}

function SavedViewer({ book }: { book: Book }) {
  const lib = useLibrary()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const ctrl = useRef<AbortController | null>(null)
  const change = async (templateId: TemplateId) => { try { await lib.save({ ...book, templateId }) } catch { setErr('Could not save the new style (storage may be full).') } }
  const patch = async (b: Book) => { await lib.save(b) }
  const regenerate = async () => {
    if (!book.plan) return
    setBusy(true); ctrl.current = new AbortController()
    try {
      const res = await generateJournal(book.plan.trip, ctrl.current.signal)
      await lib.save({ ...book, plan: res, title: res.journal.title, destination: res.journal.destination, datesLabel: planDatesLabel(res.trip) })
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setErr(e instanceof ApiError ? e.message : 'Could not regenerate the journal. Please try again.')
    } finally { setBusy(false) }
  }
  return (
    <>
      <Viewer book={book} onStyle={change} onPatch={patch} onRegenerate={book.plan ? regenerate : undefined} externalToast={err} />
      {busy && <Generating destination={book.destination} days={book.plan?.trip.days ?? 3} onCancel={() => { ctrl.current?.abort(); setBusy(false) }} />}
    </>
  )
}

function Viewer({ book, isSample, onStyle, onPatch, onRegenerate, externalToast }: { book: Book; isSample?: boolean; onStyle: (t: TemplateId) => void; onPatch?: (b: Book) => Promise<void>; onRegenerate?: () => void; externalToast?: string | null }) {
  const [blobs, setBlobs] = useState<BlobRec[] | null>(null)
  useEffect(() => {
    let live = true
    if (book.kind === 'memory' && !isSample) getBlobs(book.id).then((b) => live && setBlobs(b)).catch(() => live && setBlobs([]))
    return () => { live = false }
  }, [book.id, book.kind, book.memory?.photos.length, isSample])
  const urls = useBlobUrls(blobs, book.memory?.photos)
  const wiki = usePhotos(book.plan?.journal)
  const bp = useBookPages({ templateId: book.templateId, plan: book.plan, memory: book.memory, wiki, urls })
  const pages = bp.pages
  const total = pages.length

  const [idx, setIdx] = useState(0)
  const [overview, setOverview] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => { if (externalToast) setToast(externalToast) }, [externalToast])
  useEffect(() => { setIdx((i) => Math.min(i, Math.max(0, total - 1))) }, [total])
  const go = useCallback((n: number) => setIdx(Math.max(0, Math.min(total - 1, n))), [total])
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx((i) => Math.min(total - 1, i + 1)), [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return
      if (e.key === 'Escape') { setOverview(false); setEditOpen(false); setStyleOpen(false) }
      else if (overview || editOpen) return
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, overview, editOpen])
  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 9000); return () => window.clearTimeout(t) }, [toast])

  const touch = useRef<number | null>(null)
  const auto = useRef(false)
  useEffect(() => {
    if (auto.current || isSample) return
    const q = new URLSearchParams(window.location.search)
    if (q.get('edit')) { auto.current = true; setEditOpen(true) }
    else if (q.get('download') && (book.kind === 'plan' || blobs)) {
      auto.current = true
      window.history.replaceState({}, '', window.location.pathname)
      window.setTimeout(() => void download(), 1500)
    }
  })
  const sections = useMemo(() => {
    const out: { name: string; first: number }[] = []
    pages.forEach((p, i) => { if (!out.length || out[out.length - 1].name !== p.section) out.push({ name: p.section, first: i }) })
    return out
  }, [pages])
  const current = pages[idx]
  if (!current) return null

  async function download() {
    if (exporting) return
    setExporting(true); setToast('Preparing your PDF — loading fonts and images…')
    const title = document.title
    document.title = `${book.title} — ${book.destination}`
    try { await printJournal(); setToast('In the print window choose “Save as PDF” as the destination. Tip: leave margins at “None” and keep “Background graphics” on.') }
    finally { document.title = title; setExporting(false) }
  }

  const info = templateInfo(book.templateId)
  return (
    <div className="viewer flex flex-col" data-template={book.templateId}>
      <bp.Provider>
        <header className="viewer-bar sticky top-0 z-40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <Link to={isSample ? '/' : '/collection'} className="vbtn" aria-label={isSample ? 'Back to home' : 'Back to My Travel Collection'}><ArrowLeft size={15} aria-hidden /> <span className="hidden sm:inline">{isSample ? 'Home' : 'Collection'}</span></Link>
            <div className="min-w-0 flex-1 px-1">
              <p className="truncate font-display text-lg leading-tight text-paper">
                {book.title}
                {isSample && <span className="ml-2 rounded-sm bg-mustard px-1.5 py-0.5 align-middle font-type text-[10px] uppercase tracking-widest text-ink">sample</span>}
              </p>
              <p className="truncate font-type text-[11px] uppercase tracking-[.18em] text-paper/60">
                {book.destination} · {book.datesLabel} · {info.name}
                {!isSample && <span className="ml-2 text-mustard"><Save size={11} className="mr-1 inline" aria-hidden />saved in this browser</span>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="vbtn" onClick={() => setStyleOpen((o) => !o)} aria-expanded={styleOpen} aria-controls="style-panel"><Palette size={15} aria-hidden /> Style</button>
              <button type="button" className="vbtn" onClick={() => setOverview(true)} aria-haspopup="dialog"><LayoutGrid size={15} aria-hidden /> Overview</button>
              {!isSample && <button type="button" className="vbtn" onClick={() => setEditOpen(true)} aria-haspopup="dialog"><Pencil size={15} aria-hidden /> <span className="hidden md:inline">Edit</span></button>}
              {onRegenerate && <button type="button" className="vbtn" onClick={onRegenerate}><RefreshCw size={15} aria-hidden /> <span className="hidden md:inline">Regenerate</span></button>}
              {!isSample && book.kind === 'plan' && book.status === 'upcoming' && <Link to={`/memories?from=${book.id}`} className="vbtn"><BookCheck size={15} aria-hidden /> <span className="hidden md:inline">I’ve been — add memories</span></Link>}
              {!isSample && book.kind === 'memory' && <Link to={`/memories?edit=${book.id}`} className="vbtn"><Pencil size={15} aria-hidden /> <span className="hidden md:inline">Edit memories</span></Link>}
              <button type="button" className="vbtn solid" onClick={download} disabled={exporting} aria-busy={exporting}>
                {exporting ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Download size={15} aria-hidden />}{exporting ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </div>
          {styleOpen && <div id="style-panel" className="mx-auto max-w-7xl px-4 pb-3"><StyleSwitcher value={book.templateId} onChange={(t) => { onStyle(t); setStyleOpen(false) }} /></div>}
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-3 pb-8 pt-5 sm:px-6">
          <div className="flex w-full items-center justify-center gap-3 lg:gap-8">
            <button type="button" className="navarrow hidden sm:grid" onClick={prev} disabled={idx === 0} aria-label="Previous page"><ChevronLeft size={26} /></button>
            <div className="min-w-0 flex-1" style={{ maxWidth: 860, touchAction: 'pan-y' }} aria-live="polite" key={current.id + book.templateId}
              onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
              onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) (dx < 0 ? next : prev)() }}>
              <FitPage fitHeight={250} maxScale={1.15}>{current.node(idx + 1)}</FitPage>
            </div>
            <button type="button" className="navarrow hidden sm:grid" onClick={next} disabled={idx === total - 1} aria-label="Next page"><ChevronRight size={26} /></button>
          </div>

          <nav className="mt-5 w-full max-w-[860px]" aria-label="Book pages">
            <div className="mb-3 flex items-center justify-between gap-3">
              <button type="button" className="navarrow !h-11 !w-11 sm:!hidden" onClick={prev} disabled={idx === 0} aria-label="Previous page"><ChevronLeft size={22} /></button>
              <p className="text-center font-type text-sm uppercase tracking-[.2em] text-paper/90" data-testid="page-indicator">Page {idx + 1} of {total} · <span className="text-mustard">{current.label}</span></p>
              <button type="button" className="navarrow !h-11 !w-11 sm:!hidden" onClick={next} disabled={idx === total - 1} aria-label="Next page"><ChevronRight size={22} /></button>
            </div>
            <div className="flex gap-1" role="list">
              {pages.map((p, i) => <button key={p.id} type="button" role="listitem" className="seg flex-1" aria-current={i === idx} aria-label={`Go to page ${i + 1}: ${p.label}`} title={`${i + 1} · ${p.label}`} onClick={() => go(i)} />)}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {sections.map((s) => <button key={s.name + s.first} type="button" onClick={() => go(s.first)} className={`font-type text-xs uppercase tracking-[.16em] underline-offset-4 hover:underline ${s.name === current.section ? 'text-mustard underline' : 'text-paper/60'}`}>{s.name}</button>)}
            </div>
            <p className="mx-auto mt-5 max-w-xl text-center font-type text-[11px] leading-relaxed text-paper/55">
              {book.kind === 'plan' ? book.plan?.journal.disclaimer : 'Written from the memories you supplied. Nothing was added that you did not tell us; your photographs are shown exactly as uploaded.'}
            </p>
          </nav>
        </main>

        {overview && (
          <div className="overview-scrim" role="dialog" aria-modal="true" aria-label="Book overview">
            <div className="mx-auto max-w-7xl">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-3xl text-paper">Overview · {total} pages</h2><button type="button" className="vbtn" onClick={() => setOverview(false)} autoFocus><X size={15} aria-hidden /> Close</button></div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pages.map((p, i) => (
                  <button key={p.id} type="button" className="thumb" aria-current={i === idx} onClick={() => { setIdx(i); setOverview(false) }} aria-label={`Open page ${i + 1}: ${p.label}`}>
                    <div className="pointer-events-none" aria-hidden><FitPage maxScale={1}>{p.node(i + 1)}</FitPage></div>
                    <span className="mt-2 block font-type text-[11px] uppercase tracking-[.16em]">{String(i + 1).padStart(2, '0')} · {p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {editOpen && onPatch && <EditDialog book={book} urls={urls} onClose={() => setEditOpen(false)} onSave={async (b) => { await onPatch(b); setEditOpen(false); setToast('Saved.') }} />}
        <PrintRoot book={bp} />
      </bp.Provider>
      {toast && <div className="toast" role="status">{toast} <button type="button" className="ml-2 underline" onClick={() => setToast(null)}>dismiss</button></div>}
    </div>
  )
}

function EditDialog({ book, urls, onClose, onSave }: { book: Book; urls: ReturnType<typeof useBlobUrls>; onClose: () => void; onSave: (b: Book) => Promise<void> }) {
  const [title, setTitle] = useState(book.title)
  const [dates, setDates] = useState(book.plan ? book.plan.trip.travel_dates ?? '' : book.memory?.input.dates ?? '')
  const [caps, setCaps] = useState<Record<string, string>>(() => Object.fromEntries((book.memory?.photos ?? []).map((p) => [p.id, p.caption])))
  const [busy, setBusy] = useState(false)
  async function save() {
    const t = title.trim() || book.title
    setBusy(true)
    try {
      if (book.plan) {
        const trip = { ...book.plan.trip, travel_dates: dates.trim() || undefined }
        await onSave({ ...book, title: t, datesLabel: planDatesLabel(trip), plan: { ...book.plan, trip, journal: { ...book.plan.journal, title: t } } })
      } else if (book.memory) {
        const input = { ...book.memory.input, dates: dates.trim() || undefined }
        await onSave({ ...book, title: t, datesLabel: memoryDatesLabel(input), memory: { ...book.memory, input, text: { ...book.memory.text, title: t }, photos: book.memory.photos.map((p) => ({ ...p, caption: (caps[p.id] ?? p.caption).trim() })) } })
      }
    } finally { setBusy(false) }
  }
  return (
    <div className="overview-scrim" role="dialog" aria-modal="true" aria-label="Edit book details">
      <div className="lp-card mx-auto max-w-xl p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-3xl text-ink">Edit details</h2><button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /> Close</button></div>
        <label className="field-label" htmlFor="ed-title">Title</label>
        <input id="ed-title" className="input" value={title} maxLength={90} onChange={(e) => setTitle(e.target.value)} />
        <label className="field-label mt-4" htmlFor="ed-dates">{book.plan ? 'Month or dates' : 'When you travelled'}</label>
        <input id="ed-dates" className="input" value={dates} maxLength={60} onChange={(e) => setDates(e.target.value)} />
        {book.memory && book.memory.photos.length > 0 && (
          <div className="mt-5">
            <p className="field-label">Photo captions</p>
            <ul className="grid max-h-64 gap-2 overflow-auto pr-1">
              {book.memory.photos.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  {urls[p.id] && <img src={urls[p.id].url} alt="" className="h-12 w-12 rounded object-cover" />}
                  <input className="input !py-2" aria-label={`Caption for ${p.name}`} value={caps[p.id] ?? ''} maxLength={120} placeholder="caption" onChange={(e) => setCaps({ ...caps, [p.id]: e.target.value })} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-sm text-ink/65">Changing the title, dates or captions here does not call the AI. {book.kind === 'memory' ? 'To change places, food or stories, use “Edit memories”.' : 'To change the trip itself, create a new journal or use Regenerate.'}</p>
        <div className="mt-5 flex gap-3"><button type="button" className="btn btn-primary" onClick={save} disabled={busy}>Save changes</button><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button></div>
      </div>
    </div>
  )
}

