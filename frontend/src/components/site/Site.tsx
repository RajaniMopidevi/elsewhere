import { useState } from 'react'
import { Menu, Plane, X } from 'lucide-react'
import { Link, usePath } from '../../lib/router'

export function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="Elsewhere — home">
      <Plane size={22} strokeWidth={2.4} aria-hidden style={{ transform: 'rotate(-12deg)' }} />
      Elsewhere<span className="wm-dot">.</span>
    </Link>
  )
}

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/create', label: 'Plan a trip' },
  { to: '/memories', label: 'Memory book' },
  { to: '/collection', label: 'My Travel Collection' },
]

export function SiteHeader({ showStart = true }: { showStart?: boolean }) {
  const path = usePath().replace(/\/+$/, '') || '/'
  const [open, setOpen] = useState(false)
  return (
    <header className="lp-nav relative z-10 mx-auto w-full max-w-7xl px-5 py-5 md:px-10">
      <div className="flex items-center justify-between gap-4">
        <Wordmark />
        <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="navlink" aria-current={path === n.to ? 'page' : undefined} style={path === n.to ? { textDecoration: 'underline', textUnderlineOffset: 6 } : undefined}>{n.label}</Link>
          ))}
          {showStart && <Link to="/create" className="btn btn-ghost btn-sm">Start creating</Link>}
        </nav>
        <button type="button" className="btn btn-ghost btn-sm lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={18} /> : <Menu size={18} />} Menu
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="mt-4 grid gap-2 lg:hidden" aria-label="Main (mobile)">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="lp-card px-4 py-3 font-display text-xl" onClick={() => setOpen(false)} aria-current={path === n.to ? 'page' : undefined}>{n.label}</Link>)}
        </nav>
      )}
    </header>
  )
}

export function jump(e: React.MouseEvent, id: string) {
  const el = document.getElementById(id)
  if (el) {
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function SiteFooter() {
  return (
    <footer className="relative border-t-2 border-ink/80 bg-paper px-5 py-9 md:px-10" style={{ background: '#f1e6cd' }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 max-w-md font-hand text-xl leading-tight text-ink/70">
            a travel diary, written and arranged for you — then yours to print.
          </p>
        </div>
        <div className="font-type text-xs leading-relaxed tracking-wide text-ink/70 md:max-w-md md:text-right">
          <p>Journals are written by Google Gemini from general knowledge, without live data.</p>
          <p>Always verify opening hours, prices and travel times before you go.</p>
          <p className="mt-2">
            Photos, when shown, come from Wikipedia &amp; Wikimedia Commons (credited per image). Illustrations are drawn in code.
          </p>
          <p className="mt-3 flex gap-5 md:justify-end">
            <Link to="/create" className="underline decoration-dotted underline-offset-4 hover:text-coral">Start creating</Link>
            <Link to="/memories" className="underline decoration-dotted underline-offset-4 hover:text-coral">Memory book</Link>
            <Link to="/collection" className="underline decoration-dotted underline-offset-4 hover:text-coral">My Travel Collection</Link>
            <Link to="/sample" className="underline decoration-dotted underline-offset-4 hover:text-coral">Sample journal</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
