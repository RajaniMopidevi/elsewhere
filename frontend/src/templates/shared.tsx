import type { ReactNode } from 'react'
import type { TemplateId } from '../lib/books'
import { smooth } from '../lib/geom'
import { hash } from '../lib/art'
import { PageShell, Slot, clip } from './common'
import type { KitProps } from './common'
import type { Content } from './content'
import { Compass } from './decor'

type C<K extends Content['kind']> = Extract<Content, { kind: K }>

// --------------------------------------------------------------------------------------------- decorative route map
const W = 640, H = 520
function rng(seed: number) { let s = seed || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

/** An illustrated (NOT live) route sketch: a made-up landmass with numbered stops joined by a hand-drawn path. */
export function RouteMap({ stops, tpl, seed }: { stops: string[]; tpl: TemplateId; seed: string }) {
  const h = hash(seed)
  const r = rng(h + 7)
  const n = Math.max(2, stops.length)
  const pts: [number, number][] = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const x = W / 2 + Math.sin(t * Math.PI * 2.2 + (h % 5)) * (W * 0.3) + (r() - 0.5) * 36
    return [Math.max(70, Math.min(W - 70, x)), 50 + t * (H - 100)]
  })
  const land: [number, number][] = Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, k = 0.8 + rng(h + i * 13)() * 0.22; return [W / 2 + Math.cos(a) * W * 0.44 * k, H / 2 + Math.sin(a) * H * 0.46 * k] })
  const closed = [...land, land[0], land[1]]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="routemap" role="img" aria-label="Illustrated route sketch (not a live map)">
      <path className="rm-land" d={smooth(closed) + 'Z'} />
      <path className="rm-water" d={`M${W * 0.08} ${H * 0.3}C${W * 0.3} ${H * 0.18} ${W * 0.4} ${H * 0.5} ${W * 0.62} ${H * 0.4}S${W * 0.9} ${H * 0.2} ${W * 0.98} ${H * 0.34}`} />
      <path className="rm-path" d={smooth(pts)} />
      {pts.map(([x, y], i) => {
        const left = x > W / 2
        return (
          <g key={i} className="rm-stop">
            <circle className="rm-pin" cx={x} cy={y} r="15" />
            <text className="rm-num" x={x} y={y + 5.5} textAnchor="middle">{i + 1}</text>
            {stops[i] && <text className="rm-label" x={left ? x - 24 : x + 24} y={y + 5} textAnchor={left ? 'end' : 'start'}>{clip(stops[i], 22)}</text>}
          </g>
        )
      })}
      {tpl === 'playful' && <><circle cx="56" cy="56" r="20" className="rm-sun" /><path className="rm-cloud" d="M520 70c-16 0-22-16-8-22 0-12 18-18 28-8 8-8 26-4 28 10 12 0 16 18 2 20z" /></>}
      {tpl === 'nature' && <g className="rm-leaves">{[[90, 400, -20], [540, 120, 30], [560, 420, 200], [70, 150, 150]].map(([x, y, rot], i) => <path key={i} d="M0 0c10-18 28-20 38-12-8 14-22 22-38 12z" transform={`translate(${x} ${y}) rotate(${rot})`} />)}</g>}
    </svg>
  )
}

// --------------------------------------------------------------------------------------------- generic pages
const Head = ({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) => (
  <div className="g-head">{eyebrow && <small className="g-eyebrow">{eyebrow}</small>}<h2 className="g-title">{title}</h2>{sub && <p className="g-sub">{sub}</p>}</div>
)

export function GenericRoute({ tpl, ...p }: KitProps<C<'route'>> & { tpl: TemplateId }) {
  const { c, m } = p
  return (
    <PageShell tpl={tpl} n={p.n} m={m} label={p.label} section={p.section} kind="route">
      <Head eyebrow={m.destination} title={c.heading} sub={clip(c.summary, 190)} />
      <div className="g-map"><RouteMap stops={c.stops} tpl={tpl} seed={m.destination} />{tpl === 'mono' || tpl === 'magazine' ? <Compass className="g-compass" /> : null}<span className="g-maptag">illustrative sketch · not a live map</span></div>
      <ol className="g-stops">{c.stops.slice(0, 10).map((s, i) => <li key={i}><b>{i + 1}</b>{clip(s, 34)}</li>)}</ol>
      {c.clusters.length > 0 && (
        <div className="g-clusters">{c.clusters.slice(0, 3).map((cl, i) => <div key={i}><strong>{clip(cl.name, 26)}</strong><span>{clip(cl.places.slice(0, 4).join(' · '), 80)}</span></div>)}</div>
      )}
    </PageShell>
  )
}

export function GenericStay({ tpl, ...p }: KitProps<C<'stay'>> & { tpl: TemplateId }) {
  const { c, m } = p
  return (
    <PageShell tpl={tpl} n={p.n} m={m} label={p.label} section={p.section} kind="stay">
      <Head eyebrow={m.destination} title={c.heading} sub={clip(c.note, 200)} />
      <div className="g-cards">
        {c.areas.slice(0, 3).map((a, i) => (
          <article key={i} className="g-card"><small>Area {i + 1}{a.best_for ? ` · best for ${clip(a.best_for, 26)}` : ''}</small><h3>{clip(a.name, 36)}</h3><p>{clip(a.why || a.vibe, 150)}</p></article>
        ))}
      </div>
      {c.stays.length > 0 && <h4 className="g-sub2">Places to look at <em>· verify before booking</em></h4>}
      <div className="g-cards two">
        {c.stays.slice(0, 4).map((s, i) => (
          <article key={i} className="g-card"><small>{clip([s.style, s.area].filter(Boolean).join(' · '), 40)}</small><h3>{clip(s.name, 34)}</h3><p>{clip(s.description, 110)}</p><span className="g-verify">✱ verify first</span></article>
        ))}
      </div>
      <div className="g-illo"><Slot imgs={[]} illo="hotel" /></div>
    </PageShell>
  )
}

export function GenericGallery({ tpl, ...p }: KitProps<C<'gallery'>> & { tpl: TemplateId }) {
  const { c, m } = p
  return (
    <PageShell tpl={tpl} n={p.n} m={m} label={p.label} section={p.section} kind="gallery">
      <Head eyebrow={m.destination} title={c.heading} sub={c.sub} />
      <div className="g-gallery"><Slot imgs={c.photos} layout={c.layout} /></div>
    </PageShell>
  )
}

function Lines({ n = 5 }: { n?: number }) { return <div className="g-lines">{Array.from({ length: n }, (_, i) => <i key={i} />)}</div> }

export function GenericClosing({ tpl, extra, ...p }: KitProps<C<'closing'>> & { tpl: TemplateId; extra?: ReactNode }) {
  const { c, m } = p
  return (
    <PageShell tpl={tpl} n={p.n} m={m} label={p.label} section={p.section} kind="closing">
      <Head eyebrow={m.mode === 'memory' ? m.destination : 'before you go'} title={c.heading} />
      <div className={`g-blocks b${c.blocks.length}`}>
        {c.blocks.map((b, i) => (
          <section key={i} className={`g-block ${b.check ? 'check' : ''}`}>
            <h3>{b.title}</h3>
            <ul>{b.items.slice(0, b.check ? 10 : 6).map((t, k) => <li key={k}>{clip(t, b.check ? 36 : m.mode === 'memory' ? 170 : 120)}</li>)}</ul>
          </section>
        ))}
      </div>
      {c.photos.length > 0 && <div className="g-keep"><Slot imgs={c.photos} layout={c.layout} /></div>}
      {c.note ? (
        <aside className="g-note"><small>{c.noteTitle}</small><p>{clip(c.note, 260)}</p></aside>
      ) : c.notesLines ? (
        <aside className="g-note lines"><small>{c.noteTitle ?? 'my notes'}</small><Lines n={m.mode === 'plan' ? 5 : 3} /></aside>
      ) : null}
      {extra}
      {c.disclaimer && <p className="g-disclaimer"><b>Heads-up:</b> {clip(c.disclaimer, 240)}{m.credits ? ' Photographs: Wikipedia & Wikimedia Commons contributors, under their respective open licences.' : ''}</p>}
    </PageShell>
  )
}
