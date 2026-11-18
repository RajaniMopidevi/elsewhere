import { Illo } from '../../components/scrap/Illustrations'
import { Gingham, Postage, RoundStamp, Tape, Ticket, Squiggle, Star } from '../../components/scrap/Decor'
import { PageShell, Slot, clip } from '../common'
import type { Own, PC } from './types'

const T = 'vintage' as const

/** Vintage memory pages — same visual language as the original plan journal (kraft, postage, tape, tickets). */
function Cover(p: PC<'cover'>) {
  const { c, m } = p
  const dest = clip(m.destination, 22).toUpperCase()
  const size = Math.max(34, Math.min(120, Math.floor(600 / (dest.length * 0.8))))
  const [a, b, d] = c.photos
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="cover" theme="t-kraft" bare>
      <Gingham style={{ left: -34, bottom: 70, width: 250, height: 190, transform: 'rotate(-9deg)' }} />
      <Tape style={{ left: 40, bottom: 210, transform: 'rotate(-30deg)' }} />
      <Postage value={clip(c.dates, 14) || 'MEMORIES'} style={{ left: 46, top: 44, transform: 'rotate(-5deg)' }}><Illo name={m.hero} /></Postage>
      <Postage value="AIR MAIL" className="alt" style={{ left: 196, top: 84, transform: 'rotate(4deg)' }}><Illo name="plane" /></Postage>
      <RoundStamp top={m.destination} bottom="remembered" center="✈" className="cover-stamp" style={{ right: 44, top: 36 }} />
      <div className="torn" style={{ left: 64, top: 268, width: 666 }}><span className="script">{m.mode === 'memory' ? 'our travel book' : 'my travel journal'}</span><h1 style={{ fontSize: size }}>{dest}</h1><p>{clip(c.title, 60)}</p></div>
      <Ticket title="ADMIT ONE" lines={[clip(c.dates, 22) || 'one trip', clip(c.people ?? '', 24) || 'to remember']} style={{ left: 56, top: 590, transform: 'rotate(-6deg)' }} />
      {a ? <figure className="polaroid" style={{ right: 56, top: 538, transform: 'rotate(4deg)' }}><Tape style={{ left: 96, top: -16, transform: 'rotate(-4deg)' }} /><div className="vp-img"><Slot imgs={[a]} /></div><figcaption>{clip(a.caption ?? '', 30)}</figcaption></figure> : <Illo name="camera" className="cover-hero" />}
      {b && <figure className="polaroid sm" style={{ left: 300, top: 760, transform: 'rotate(-5deg)' }}><div className="vp-img"><Slot imgs={[b]} /></div></figure>}
      {d && <figure className="polaroid sm" style={{ right: 80, top: 820, transform: 'rotate(7deg)' }}><div className="vp-img"><Slot imgs={[d]} /></div></figure>}
      <div className="strips"><div className="strip" style={{ transform: 'rotate(-1deg)', marginLeft: 20 }}>{clip(c.subtitle || c.title, 80)}</div></div>
      <Squiggle className="cover-squig" />
    </PageShell>
  )
}

function Intro(p: PC<'intro'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="intro" theme="t-cream">
      <div className="vi-head"><span className="script">{c.eyebrow}</span><h2>{clip(c.heading, 22)}</h2></div>
      <div className="vi-letter"><Tape style={{ left: 300, top: -14, transform: 'rotate(2deg)' }} /><p>{clip(c.body, 640)}</p>{c.why && <p className="hand-note">{clip(c.why, 230)}</p>}</div>
      <div className="vi-photos"><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <div className="vi-tickets">{c.kv.slice(0, 3).map((x, i) => <Ticket key={i} title={x.k.toUpperCase()} lines={[clip(x.v, 22)]} style={{ transform: `rotate(${i % 2 ? 3 : -3}deg)` }} />)}</div>
      {c.people && c.people.length > 0 && <div className="vi-people"><span className="script">travelling together</span>{c.people.slice(0, 5).map((x, i) => <b key={i}><Star />{clip(x, 20)}</b>)}</div>}
      {c.list.length > 0 && <div className="vi-list"><b>{c.listTitle}</b><ul>{c.list.slice(0, 8).map((x, i) => <li key={i}>{clip(x, 34)}</li>)}</ul></div>}
    </PageShell>
  )
}

function Items(p: PC<'items'>) {
  const { c, m } = p
  const theme = c.variant === 'food' ? 't-mustard' : 't-grid'
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind={`items ${c.variant}`} theme={theme}>
      <div className="vt-head"><span className="script">{c.heading.toLowerCase()}</span><small>{c.sub}</small></div>
      {c.photos.length > 0 && <div className="vt-extra"><Slot imgs={c.photos} layout={c.layout} /></div>}
      <div className={`vt-cards n${c.items.length}`}>
        {c.items.map((it, i) => (
          <article key={i} className="vt-card" style={{ transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}>
            <Tape style={{ left: '42%', top: -14 }} />
            <div className="vt-img"><Slot imgs={it.imgs} illo={it.illo} /></div>
            <div className="vt-txt"><small>{c.startIndex + i + 1}{it.kicker ? ` · ${clip(it.kicker, 24)}` : ''}</small><h3>{clip(it.title, 34)}</h3>{it.text && <p>{clip(it.text, m.mode === 'memory' ? 210 : 150)}</p>}{it.note && <span className="hand-note">{clip(it.note, 60)}</span>}{it.verify && <span className="g-verify">✱ verify first</span>}</div>
          </article>
        ))}
      </div>
    </PageShell>
  )
}

function Day(p: PC<'day'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="day" theme="t-grid">
      <div className="vd-head"><Ticket title={`DAY ${c.day}`} lines={[clip(c.area ?? '', 22) || m.destination]} /><h2>{clip(c.title, 46)}</h2></div>
      {c.intro && <p className="vd-intro">{clip(c.intro, 280)}</p>}
      <div className={`vd-photos ${c.photos.length ? "" : "noph"}`}><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <ol className="vd-stops">{c.stops.slice(0, 7).map((s, i) => <li key={i}><b>{i + 1}</b><div><strong>{clip(s.title, 46)}</strong>{s.text && <p>{clip(s.text, 130)}</p>}</div></li>)}</ol>
      {c.food && <div className="vd-food"><span className="script">tasted</span> {clip(c.food.name, 36)}{c.food.note ? ` — ${clip(c.food.note, 80)}` : ''}</div>}
      {c.caption && <span className="hand-note vd-cap">{clip(c.caption, 100)}</span>}
    </PageShell>
  )
}

export const vintageMemory: Own = { Cover, Intro, Items, Day }
