import { useEffect, useState } from 'react'
import { BookCheck, BookOpen, Download, Pencil, Plus, Trash2, X } from 'lucide-react'
import { SiteFooter, SiteHeader } from '../components/site/Site'
import { Link } from '../lib/router'
import { useLibrary } from '../lib/library'
import { storageEstimate } from '../lib/db'
import { formatDate } from '../lib/books'
import type { Book } from '../lib/books'
import { templateInfo } from '../templates/registry'
import { Illo } from '../components/scrap/Illustrations'
import { heroIllo } from '../lib/art'

function BookCover({ book }: { book: Book }) {
  const info = templateInfo(book.templateId)
  const j = book.plan?.journal
  const hero = heroIllo(book.destination, j?.country ?? '', j?.design ?? book.memory?.text.design as never)
  const dest = book.destination.length > 16 ? book.destination.slice(0, 15) + '…' : book.destination
  return (
    <div className={`bk bk-${book.templateId}`} aria-hidden>
      <span className="bk-spine" />
      <div className="bk-face">
        <span className="bk-status">{book.status === 'upcoming' ? 'upcoming' : 'completed'}</span>
        <div className="bk-art"><Illo name={hero} /></div>
        <h3 className="bk-dest">{dest}</h3>
        <p className="bk-title">{book.title}</p>
        <p className="bk-dates">{book.datesLabel}</p>
        <p className="bk-tpl">{info.name}</p>
      </div>
    </div>
  )
}

function Card({ book, planOf, onDelete }: { book: Book; planOf?: Book; onDelete: (b: Book) => void }) {
  return (
    <li className="bk-item" data-testid="book-card" data-kind={book.kind} data-status={book.status}>
      <Link to={`/book/${book.id}`} className="bk-link" aria-label={`Open ${book.title}, ${book.destination}`}><BookCover book={book} /></Link>
      <div className="bk-meta">
        <p className="font-display text-xl leading-tight text-paper">{book.title}</p>
        <p className="font-type text-[11px] uppercase tracking-[.14em] text-paper/65">{book.destination} · {book.datesLabel}</p>
        <p className="font-type text-[11px] uppercase tracking-[.14em] text-paper/55">{templateInfo(book.templateId).name} · {book.status} · saved {formatDate(book.createdAt)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link to={`/book/${book.id}`} className="vbtn"><BookOpen size={14} aria-hidden /> Open</Link>
          <Link to={`/book/${book.id}?download=1`} className="vbtn"><Download size={14} aria-hidden /> PDF</Link>
          <Link to={`/book/${book.id}?edit=1`} className="vbtn"><Pencil size={14} aria-hidden /> Edit</Link>
          {book.kind === 'plan' && book.status === 'upcoming' && <Link to={`/memories?from=${book.id}`} className="vbtn solid"><BookCheck size={14} aria-hidden /> Mark as completed</Link>}
          <button type="button" className="vbtn" onClick={() => onDelete(book)}><Trash2 size={14} aria-hidden /> Delete</button>
        </div>
        {planOf && <Link to={`/book/${planOf.id}`} className="mt-2 inline-block font-type text-[11px] uppercase tracking-[.14em] text-mustard underline underline-offset-4">Original plan · {planOf.title}</Link>}
      </div>
    </li>
  )
}

export default function Collection() {
  const lib = useLibrary()
  const [del, setDel] = useState<Book | null>(null)
  const [est, setEst] = useState<{ usage: number; quota: number } | null>(null)
  useEffect(() => { storageEstimate().then(setEst) }, [lib.books])
  const upcoming = lib.books.filter((b) => b.kind === 'plan' && b.status === 'upcoming')
  const completed = lib.books.filter((b) => b.kind === 'memory')
  const planFor = (b: Book) => (b.linkedPlanId ? lib.books.find((x) => x.id === b.linkedPlanId) : undefined)
  const mb = (n: number) => (n / 1048576).toFixed(n > 10485760 ? 0 : 1)

  async function confirmDelete() {
    if (!del) return
    const id = del.id
    setDel(null)
    await lib.remove(id)
  }

  return (
    <div className="min-h-screen">
      <div className="shelf-room">
        <div className="paper-bg" style={{ paddingBottom: 24 }}>
          <SiteHeader showStart={false} />
          <div className="mx-auto max-w-7xl px-5 pb-8 pt-2 md:px-10">
            <p className="eyebrow mb-3">your bookshelf</p>
            <h1 className="font-display text-5xl leading-[1.02] text-ink md:text-6xl">My Travel <span className="hl-red">Collection</span></h1>
            <p className="mt-4 max-w-2xl text-lg text-ink/75">Every journal and memory book you have made, kept in this browser. Open one, change its style, download the PDF again — or start a new one.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/create" className="btn btn-primary"><Plus size={18} aria-hidden /> Plan a trip</Link>
              <Link to="/memories" className="btn btn-ghost"><Plus size={18} aria-hidden /> Make a memory book</Link>
            </div>
          </div>
        </div>

        <div className="shelf-wood px-5 py-10 md:px-10">
          <div className="mx-auto max-w-7xl">
            {!lib.ready ? <p className="font-type uppercase tracking-widest text-paper/70">opening your shelf…</p> : (
              <>
                {!lib.persistent && <p className="mb-6 rounded border-2 border-mustard bg-[#fbf0cf] px-4 py-3 text-sm text-[#5b4308]">Your browser is blocking local storage, so books are only kept until you close this tab.</p>}
                <Shelf title="Upcoming Trips" id="upcoming" empty={<>No upcoming trips yet. <Link to="/create" className="underline">Plan one</Link> and it will appear here.</>} books={upcoming} onDelete={setDel} />
                <Shelf title="Completed Trips" id="completed" empty={<>No memory books yet. <Link to="/memories" className="underline">Turn a trip you took into a book</Link>.</>} books={completed} planFor={planFor} onDelete={setDel} />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 py-4 text-center font-type text-[11px] uppercase tracking-[.16em] text-ink/60" style={{ background: '#f1e6cd' }}>
        Saved only in this browser (IndexedDB){est ? ` · using ${mb(est.usage)} MB of about ${mb(est.quota)} MB available` : ''} · clearing site data removes your books
      </div>
      <SiteFooter />
      {del && (
        <div className="overview-scrim" role="alertdialog" aria-modal="true" aria-label="Delete this book?">
          <div className="lp-card mx-auto max-w-md p-6">
            <h2 className="font-display text-3xl text-ink">Delete “{del.title}”?</h2>
            <p className="mt-2 text-ink/75">{del.kind === 'memory' ? 'The book and its photographs will be removed from this browser. Your original image files elsewhere are not touched.' : 'The journal will be removed from this browser.'} This cannot be undone.</p>
            <div className="mt-5 flex gap-3"><button type="button" className="btn btn-primary" onClick={confirmDelete}>Delete it</button><button type="button" className="btn btn-ghost" onClick={() => setDel(null)} autoFocus><X size={16} /> Keep it</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

function Shelf({ title, id, books, empty, onDelete, planFor }: { title: string; id: string; books: Book[]; empty: React.ReactNode; onDelete: (b: Book) => void; planFor?: (b: Book) => Book | undefined }) {
  return (
    <section className="mb-12" aria-labelledby={`shelf-${id}`} data-testid={`shelf-${id}`}>
      <h2 id={`shelf-${id}`} className="mb-4 font-display text-3xl text-paper">{title} <span className="font-type text-sm text-paper/60">({books.length})</span></h2>
      {books.length === 0 ? <p className="py-6 text-lg text-paper/75">{empty}</p> : (
        <ul className="bk-row">{books.map((b) => <Card key={b.id} book={b} planOf={planFor?.(b)} onDelete={onDelete} />)}</ul>
      )}
      <div className="shelf-plank" aria-hidden />
    </section>
  )
}

