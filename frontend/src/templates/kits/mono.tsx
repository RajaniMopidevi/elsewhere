import { PageShell, Slot, Collage, clip, pad } from '../common'
import { CropMarks } from '../decor'
import type { Own, PC } from './types'

const T = 'mono' as const

function Cover(p: PC<'cover'>) {
  const { c, m } = p
  const t = c.title
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="cover" bare>
      <CropMarks />
      <div className="mc-top"><span>Elsewhere</span><span>{m.mode === 'memory' ? 'A memory book' : 'A travel journal'}</span><span>{clip(c.dates, 30)}</span></div>
      <div className="mc-photo">{c.photos.length ? <Collage photos={c.photos} layout={c.layout} captions={false} /> : <Slot imgs={[]} illo={m.hero} />}</div>
      <div className="mc-dest">{clip(m.destination, 22).toUpperCase()}</div>
      <h1 className="mc-title">{clip(t, 70)}</h1>
      <div className="mc-foot">
        <p>{clip(c.subtitle, 130)}</p>
        {c.people && <small>{c.people}</small>}
      </div>
    </PageShell>
  )
}

function Intro(p: PC<'intro'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="intro">
      <div className="mi-wrap">
        <small className="eyebrow">{c.eyebrow}</small>
        <h2 className="mi-h">{clip(c.heading, 28)}</h2>
        {c.deck && <p className="mi-deck">{clip(c.deck, 190)}</p>}
        <div className="mi-cols">
          <div className="mi-body">
            <p className="dropcap">{clip(c.body, 760)}</p>
            {c.why && <blockquote>{clip(c.why, 330)}</blockquote>}
          </div>
          <aside>
            {c.people && c.people.length > 0 && <div className="mi-people"><small>Travelled with</small>{c.people.slice(0, 6).map((x, i) => <b key={i}>{clip(x, 22)}</b>)}</div>}
            <dl>{c.kv.map((x, i) => <div key={i}><dt>{x.k}</dt><dd>{clip(x.v, 26)}</dd></div>)}</dl>
            {c.list.length > 0 && <div className="mi-list"><small>{c.listTitle}</small><ul>{c.list.slice(0, 8).map((x, i) => <li key={i}>{clip(x, 40)}</li>)}</ul></div>}
          </aside>
        </div>
        <div className="mi-photo"><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      </div>
    </PageShell>
  )
}

function Items(p: PC<'items'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind={`items ${c.variant}`}>
      <div className="mt-head"><h2>{c.heading}</h2><small>{c.sub}</small></div>
      {c.photos.length > 0 && <div className="mt-strip"><Collage photos={c.photos} layout={c.layout} /></div>}
      <div className={`mt-rows n${c.items.length}`}>
        {c.items.map((it, i) => (
          <article key={i} className="mt-row">
            <b className="mt-num">{pad(c.startIndex + i + 1)}</b>
            <div className="mt-img"><Slot imgs={it.imgs} illo={it.illo} layout="auto" /></div>
            <div className="mt-txt">
              {it.kicker && <small>{clip(it.kicker, 30)}</small>}
              <h3>{clip(it.title, 40)}</h3>
              {it.text && <p>{clip(it.text, m.mode === 'memory' ? 240 : 190)}</p>}
              {it.note && <em>{clip(it.note, 70)}</em>}
              {it.verify && <span className="g-verify">verify before you go</span>}
            </div>
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
      <div className="md-wrap">
        <div className="md-num"><small>Day</small><b>{pad(c.day)}</b></div>
        <div className="md-main">
          <h2>{clip(c.title, 60)}</h2>
          {c.area && <small className="eyebrow">{clip(c.area, 40)}</small>}
          {c.intro && <p className="md-intro">{clip(c.intro, 300)}</p>}
        </div>
      </div>
      <div className={`md-photo ${c.photos.length ? "" : "noph"}`}><Slot imgs={c.photos} illo={m.hero} layout={c.layout} /></div>
      <ol className="md-stops">
        {c.stops.slice(0, 7).map((s, i) => <li key={i}><span>{s.part ?? pad(i + 1)}</span><div><b>{clip(s.title, 50)}</b>{s.text && <p>{clip(s.text, 140)}</p>}</div></li>)}
      </ol>
      {c.food && <div className="md-food"><small>Eat</small><b>{clip(c.food.name, 40)}</b>{c.food.note && <span>{clip(c.food.note, 90)}</span>}</div>}
      {c.caption && <p className="md-cap">“{clip(c.caption, 110)}”</p>}
    </PageShell>
  )
}

export const mono: Own = { Cover, Intro, Items, Day }
