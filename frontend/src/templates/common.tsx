import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { CollageLayout, TemplateId } from '../lib/books'
import type { IlloName } from '../lib/art'
import { Illo } from '../components/scrap/Illustrations'
import type { BookMeta, Img } from './content'

export const clip = (s: string | undefined, n: number) => {
  const t = (s ?? '').trim()
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t
}
export const pad = (n: number) => String(n).padStart(2, '0')

export interface KitProps<C> { c: C; m: BookMeta; n: number; label: string; section: string }

// ---------------------------------------------------------------------------------------------- photos
export function PhotoImg({ img }: { img: Img }) {
  const [bad, setBad] = useState(false)
  if (img.placeholder || !img.src || bad) {
    return (
      <div className="ph" role="img" aria-label="Photo placeholder">
        <svg viewBox="0 0 48 48" aria-hidden><path d="M8 16h8l3-5h10l3 5h8v22H8z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><circle cx="24" cy="26" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" /></svg>
        <span>your photo</span>
      </div>
    )
  }
  return <img src={img.src} alt={img.alt ?? ''} loading="eager" decoding="sync" style={{ objectFit: img.fit === 'contain' ? 'contain' : 'cover' }} data-credit={img.credit} onError={() => setBad(true)} />
}

export type ResolvedLayout = 'single' | 'duo' | 'hero' | 'grid' | 'scatter' | 'strip'

export function resolveLayout(layout: CollageLayout, n: number): ResolvedLayout {
  if (n <= 1) return 'single'
  if (layout === 'hero') return n === 2 ? 'duo' : 'hero'
  if (layout === 'grid') return n === 2 ? 'duo' : 'grid'
  if (layout === 'scatter') return 'scatter'
  if (layout === 'strip') return 'strip'
  if (n === 2) return 'duo'
  if (n === 3) return 'hero'
  if (n === 4) return 'grid'
  return n <= 6 ? 'hero' : 'grid'
}

const SCATTER: [number, number][] = [[1, 2], [50, 0], [22, 30], [0, 56], [52, 52], [26, 66], [60, 28], [4, 30], [40, 14]]
const ROT = [-3.2, 2.6, -1.4, 3.4, -2.4, 1.6, -3.8, 2.2, -1.2]

/** Arranges photographs in one of several collage layouts. Frames are styled per template (see templates.css). */
export function Collage({ photos, layout = 'auto', className = '', stack = false, captions = true }: { photos: Img[]; layout?: CollageLayout; className?: string; stack?: boolean; captions?: boolean }) {
  if (!photos.length) return null
  const shown = photos.slice(0, 9)
  const lay = resolveLayout(layout, shown.length)
  const cls = `collage cl-${lay} n${shown.length} ${stack ? 'stack' : ''} ${className}`
  return (
    <div className={cls}>
      {shown.map((p, i) => (
        <figure key={i} className="cf" style={{ '--r': `${ROT[i % ROT.length]}deg`, '--x': `${SCATTER[i % SCATTER.length][0]}%`, '--y': `${SCATTER[i % SCATTER.length][1]}%`, '--i': i } as CSSProperties}>
          <div className="cf-img"><PhotoImg img={p} /></div>
          {captions && p.caption && <figcaption>{clip(p.caption, 60)}</figcaption>}
        </figure>
      ))}
    </div>
  )
}

/** A collage when we have photographs, otherwise the hand-drawn illustration (so pages never look empty). */
export function Slot({ imgs, illo, layout = 'auto', className = '', stack }: { imgs: Img[]; illo?: IlloName; layout?: CollageLayout; className?: string; stack?: boolean }) {
  if (imgs.length) return <Collage photos={imgs} layout={layout} className={className} stack={stack} />
  if (!illo) return null
  return <div className={`ph-illo ${className}`}><Illo name={illo} /></div>
}

// ---------------------------------------------------------------------------------------------- page shell
interface ShellProps { tpl: TemplateId; n: number; m: BookMeta; label: string; section: string; kind: string; bare?: boolean; theme?: string; className?: string; children: ReactNode }

/** One fixed 794×1123 page with its template's background, header and footer. */
export function PageShell({ tpl, n, m, label, section, kind, bare, theme = '', className = '', children }: ShellProps) {
  return (
    <section className={`page tpl tpl-${tpl} pg-${kind} ${theme} ${className}`} aria-label={`Page ${n}: ${label}`}>
      <div className="paper-grain" aria-hidden />
      {children}
      {!bare && <Chrome tpl={tpl} n={n} m={m} label={label} section={section} />}
    </section>
  )
}

function Chrome({ tpl, n, m, label, section }: { tpl: TemplateId; n: number; m: BookMeta; label: string; section: string }) {
  switch (tpl) {
    case 'mono':
      return (
        <>
          <header className="hd"><span>Elsewhere</span><span>{clip(m.destination, 28)}</span><span>{section}</span></header>
          <footer className="ft"><span>{pad(n)} / {pad(m.total)}</span><i /><span>{clip(m.title, 44)}</span></footer>
        </>
      )
    case 'magazine':
      return (
        <>
          <header className="hd"><em>{label}</em><span>{clip(m.destination, 30)}</span></header>
          <footer className="ft"><b>{n}</b><span>Elsewhere · The Travel Journal{m.dates ? ` · ${clip(m.dates, 26)}` : ''}</span></footer>
        </>
      )
    case 'playful':
      return (
        <>
          <header className="hd"><span>{label}</span></header>
          <footer className="ft"><b>{n}</b></footer>
        </>
      )
    case 'nature':
      return (
        <footer className="ft">
          <svg viewBox="0 0 220 20" aria-hidden><path d="M2 10h84M134 10h84" stroke="currentColor" strokeWidth="1" fill="none" /><path d="M96 10c4-8 10-8 14 0-4 8-10 8-14 0zM112 10c4-8 10-8 14 0" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
          <b>{n}</b>
        </footer>
      )
    default:
      return (
        <div className="folio" aria-hidden>
          <span>{pad(n)}</span><i /><span>{label}</span><i /><span>{n}/{m.total}</span>
        </div>
      )
  }
}

/** Fit a word on one line: font size from its length and the available width. */
export const fitFont = (text: string, width: number, ratio: number, max: number, min = 20) => Math.max(min, Math.min(max, Math.floor(width / (Math.max(1, text.length) * ratio))))
