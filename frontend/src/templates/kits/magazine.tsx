import { PageShell, Slot, Collage, clip, pad } from '../common'
import { Fleuron } from '../decor'
import type { Own, PC } from './types'

const T = 'magazine' as const

function Cover(p: PC<'cover'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="cover" bare>
      <div className="gc-bg">{c.photos.length ? <Collage photos={c.photos.slice(0, 1)} captions={false} /> : <Slot imgs={[]} illo={m.hero} />}</div>
      <div className="gc-veil" />
      <div className="gc-mast"><span>ELSEWHERE</span><i>the travel journal</i></div>
      <div className="gc-issue"><span>{m.mode === 'memory' ? 'The Memory Issue' : 'The Planning Issue'}</span><span>{clip(c.dates, 30)}</span></div>
      <ul className="gc-lines">
        {c.photos.length > 1 && <li>{c.photos.length - 1} more photographs inside</li>}
        {c.people && <li>{c.people}</li>}
        {c.subtitle && <li>{clip(c.subtitle, 70)}</li>}
      </ul>
      <div className="gc-title"><small>{clip(m.destination, 26)}</small><h1>{clip(c.title, 64)}</h1><Fleuron /></div>
    </PageShell>
  )
}

function Intro(p: PC<'intro'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="intro">
      <div className="gi-photo"><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <div className="gi-head"><small>{c.eyebrow}</small><h2>{clip(c.heading, 26)}</h2>{c.deck && <p>{clip(c.deck, 180)}</p>}</div>
      <div className="gi-cols"><p className="dropcap">{clip(c.body, 900)}</p></div>
      {c.why && <blockquote className="gi-pull">{clip(c.why, 240)}</blockquote>}
      <div className="gi-side">
        {c.people && c.people.length > 0 && <div><small>Travelling companions</small><b>{c.people.slice(0, 5).join(', ')}</b></div>}
        {c.kv.map((x, i) => <div key={i}><small>{x.k}</small><b>{clip(x.v, 28)}</b></div>)}
      </div>
      {c.list.length > 0 && <div className="gi-list"><small>{c.listTitle}</small><ul>{c.list.slice(0, 8).map((x, i) => <li key={i}>{clip(x, 40)}</li>)}</ul></div>}
    </PageShell>
  )
}

function Items(p: PC<'items'>) {
  const { c, m } = p
  const lead = c.items[0]
  const rest = c.items.slice(1)
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind={`items ${c.variant}`}>
      <div className="gt-head"><small>{c.sub}</small><h2>{c.heading}</h2></div>
      {c.photos.length > 0 && <div className="gt-extra"><Collage photos={c.photos} layout={c.layout} /></div>}
      {lead && (
        <article className="gt-lead">
          <div className="gt-img"><Slot imgs={lead.imgs} illo={lead.illo} /></div>
          <div className="gt-txt"><small>{pad(c.startIndex + 1)} · {clip(lead.kicker ?? '', 28)}</small><h3>{clip(lead.title, 40)}</h3>{lead.text && <p className="dropcap">{clip(lead.text, 320)}</p>}{lead.note && <em>— {clip(lead.note, 70)}</em>}{lead.verify && <span className="g-verify">verify first</span>}</div>
        </article>
      )}
      <div className={`gt-rest n${rest.length}`}>
        {rest.map((it, i) => (
          <article key={i}>
            <div className="gt-img"><Slot imgs={it.imgs} illo={it.illo} /></div>
            <small>{pad(c.startIndex + i + 2)} · {clip(it.kicker ?? '', 24)}</small><h3>{clip(it.title, 34)}</h3>
            {it.text && <p>{clip(it.text, m.mode === 'memory' ? 170 : 120)}</p>}
            {it.verify && <span className="g-verify">verify first</span>}
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
      <div className="gd-head"><b>{c.day}</b><div><small>Day {c.day}{c.area ? ` · ${clip(c.area, 30)}` : ''}</small><h2>{clip(c.title, 56)}</h2></div></div>
      {c.intro && <p className="gd-intro">{clip(c.intro, 300)}</p>}
      <div className={`gd-photo ${c.photos.length ? "" : "noph"}`}><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <div className="gd-cols">
        <ol>{c.stops.slice(0, 7).map((s, i) => <li key={i}><small>{s.part ?? `Stop ${i + 1}`}</small><b>{clip(s.title, 50)}</b>{s.text && <p>{clip(s.text, 140)}</p>}</li>)}</ol>
        <aside>
          {c.food && <div className="gd-box"><small>At the table</small><b>{clip(c.food.name, 40)}</b>{c.food.note && <p>{clip(c.food.note, 100)}</p>}</div>}
          {c.caption && <blockquote>{clip(c.caption, 120)}</blockquote>}
        </aside>
      </div>
    </PageShell>
  )
}

export const magazine: Own = { Cover, Intro, Items, Day }
