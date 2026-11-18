import { PageShell, Slot, Collage, clip, pad } from '../common'
import { Daisy, Fern, Pressed, Sprig, Wreath } from '../decor'
import type { Own, PC } from './types'

const T = 'nature' as const

function Cover(p: PC<'cover'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="cover" bare>
      <Fern className="nc-fern l" /><Fern className="nc-fern r" /><Wreath className="nc-wreath" />
      <small className="nc-kick">{m.mode === 'memory' ? 'a keepsake journal' : 'a field guide to a journey'}</small>
      <div className="nc-arch">{c.photos.length ? <Collage photos={c.photos.slice(0, 1)} captions={false} /> : <Slot imgs={[]} illo={m.hero} />}</div>
      <Daisy className="nc-daisy" /><Pressed className="nc-pressed" />
      <h1 className="nc-title">{clip(c.title, 60)}</h1>
      <p className="nc-dest">{clip(m.destination, 30)}{c.dates ? ` · ${clip(c.dates, 28)}` : ''}</p>
      {c.people && <p className="nc-people">{c.people}</p>}
    </PageShell>
  )
}

function Intro(p: PC<'intro'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="intro">
      <Sprig className="ni-sprig" />
      <div className="ni-head"><small>{c.eyebrow}</small><h2>{clip(c.heading, 24)}</h2>{c.deck && <p>{clip(c.deck, 160)}</p>}</div>
      <div className="ni-arch"><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <div className="ni-text"><p>{clip(c.body, 700)}</p>{c.why && <blockquote>{clip(c.why, 250)}</blockquote>}</div>
      <div className="ni-card">
        {c.people && c.people.length > 0 && <div><small>with</small><b>{c.people.slice(0, 5).join(' · ')}</b></div>}
        {c.kv.map((x, i) => <div key={i}><small>{x.k}</small><b>{clip(x.v, 26)}</b></div>)}
      </div>
      {c.list.length > 0 && <div className="ni-list"><small>{c.listTitle}</small><ul>{c.list.slice(0, 8).map((x, i) => <li key={i}>{clip(x, 36)}</li>)}</ul></div>}
      <Pressed className="ni-pressed" />
    </PageShell>
  )
}

function Items(p: PC<'items'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind={`items ${c.variant}`}>
      <Fern className="nt-fern" />
      <div className="nt-head"><small>{c.sub}</small><h2>{c.heading}</h2></div>
      {c.photos.length > 0 && <div className="nt-extra"><Collage photos={c.photos} layout={c.layout} /></div>}
      <div className={`nt-list n${c.items.length}`}>
        {c.items.map((it, i) => (
          <article key={i} className={i % 2 ? 'flip' : ''}>
            <div className="nt-img"><Slot imgs={it.imgs} illo={it.illo} /></div>
            <div className="nt-txt"><small>{pad(c.startIndex + i + 1)}{it.kicker ? ` · ${clip(it.kicker, 24)}` : ''}</small><h3>{clip(it.title, 36)}</h3>{it.text && <p>{clip(it.text, m.mode === 'memory' ? 220 : 160)}</p>}{it.note && <em>{clip(it.note, 60)}</em>}{it.verify && <span className="g-verify">verify first</span>}</div>
          </article>
        ))}
      </div>
    </PageShell>
  )
}

function Day(p: PC<'day'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="day">
      <div className="nd-head"><Daisy className="nd-daisy" /><div><small>day {c.day}{c.area ? ` · ${clip(c.area, 30)}` : ''}</small><h2>{clip(c.title, 52)}</h2></div></div>
      {c.intro && <p className="nd-intro">{clip(c.intro, 280)}</p>}
      <div className={`nd-photo ${c.photos.length ? "" : "noph"}`}><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <ol className="nd-stops">{c.stops.slice(0, 7).map((s, i) => <li key={i}><i /><div><b>{clip(s.title, 48)}</b>{s.text && <p>{clip(s.text, 130)}</p>}</div></li>)}</ol>
      {c.food && <div className="nd-food"><small>from the table</small><b>{clip(c.food.name, 36)}</b>{c.food.note && <span>{clip(c.food.note, 90)}</span>}</div>}
      {c.caption && <p className="nd-cap">{clip(c.caption, 110)}</p>}
      <Sprig className="nd-sprig" />
    </PageShell>
  )
}

export const nature: Own = { Cover, Intro, Items, Day }
