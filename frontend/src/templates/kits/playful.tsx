import { PageShell, Slot, Collage, clip, pad } from '../common'
import { Burst, Confetti, Heart, Squig, SunDoodle, Cloud, DoodleArrow, Zig } from '../decor'
import type { Own, PC } from './types'

const T = 'playful' as const
const COL = ['#ff6b6b', '#2ec4b6', '#ffbf47', '#7b5cff', '#4cc9f0']

function Cover(p: PC<'cover'>) {
  const { c, m } = p
  const words = clip(m.destination, 20).toUpperCase()
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="cover" bare>
      <Confetti seed={m.destination.length} />
      <SunDoodle className="pc-sun" /><Cloud className="pc-cloud" />
      <div className="pc-title"><small>{m.mode === 'memory' ? 'our big adventure' : 'the big adventure plan'}</small><h1>{words}</h1><Squig className="pc-squig" /></div>
      <div className="pc-photos"><Slot imgs={c.photos} illo={m.hero} layout={c.layout === 'auto' ? 'scatter' : c.layout} stack /></div>
      <Burst className="pc-burst" text={clip(c.dates, 30) || 'hello!'} />
      <p className="pc-sub">{clip(c.subtitle || c.title, 90)}</p>
      {c.people && <p className="pc-people">{c.people} <Heart className="pc-heart" /></p>}
    </PageShell>
  )
}

function Intro(p: PC<'intro'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind="intro">
      <div className="pi-head"><small>{c.eyebrow}</small><h2>{clip(c.heading, 22)}</h2></div>
      <div className="pi-note"><p>{clip(c.body, 620)}</p></div>
      <div className="pi-photos"><Slot imgs={c.photos} illo={m.hero} layout={c.layout === 'auto' ? 'scatter' : c.layout} stack /></div>
      {c.why && <div className="pi-why"><b>why it was special</b><p>{clip(c.why, 220)}</p></div>}
      <div className="pi-stickers">{c.kv.map((x, i) => <span key={i} style={{ background: COL[i % COL.length] }}><small>{x.k}</small>{clip(x.v, 18)}</span>)}</div>
      {c.people && c.people.length > 0 && <div className="pi-people">{c.people.slice(0, 5).map((x, i) => <span key={i} style={{ background: COL[(i + 2) % COL.length] }}>{clip(x, 16)}</span>)}</div>}
      {c.list.length > 0 && <div className="pi-list"><b>{c.listTitle}</b><ul>{c.list.slice(0, 8).map((x, i) => <li key={i}>{clip(x, 32)}</li>)}</ul></div>}
      <DoodleArrow className="pi-arrow" />
    </PageShell>
  )
}

function Items(p: PC<'items'>) {
  const { c, m } = p
  return (
    <PageShell tpl={T} n={p.n} m={m} label={p.label} section={p.section} kind={`items ${c.variant}`}>
      <div className="pt-head"><h2>{c.heading}</h2><small>{c.sub}</small><Zig className="pt-zig" /></div>
      {c.photos.length > 0 && <div className="pt-extra"><Collage photos={c.photos} layout="scatter" stack /></div>}
      <div className={`pt-cards n${c.items.length}`}>
        {c.items.map((it, i) => (
          <article key={i} className="pt-card" style={{ '--c': COL[(c.startIndex + i) % COL.length], '--rot': `${i % 2 ? 1.6 : -1.6}deg` } as React.CSSProperties}>
            <b className="pt-num">{c.startIndex + i + 1}</b>
            <div className="pt-img"><Slot imgs={it.imgs} illo={it.illo} stack /></div>
            <div className="pt-txt">
              {it.kicker && <small>{clip(it.kicker, 26)}</small>}
              <h3>{clip(it.title, 32)}</h3>
              {it.text && <p>{clip(it.text, m.mode === 'memory' ? 200 : 150)}</p>}
              {it.note && <em>{clip(it.note, 60)}</em>}
              {it.verify && <span className="g-verify">verify first</span>}
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
      <div className="pd-head"><Burst className="pd-burst" text={`DAY ${c.day}`} /><div><h2>{clip(c.title, 44)}</h2>{c.area && <small>{clip(c.area, 36)}</small>}</div></div>
      {c.intro && <p className="pd-intro">{clip(c.intro, 260)}</p>}
      <div className={`pd-photos ${c.photos.length ? "" : "noph"}`}><Slot imgs={c.photos} illo={m.hero} layout={c.layout === 'auto' ? 'scatter' : c.layout} stack /></div>
      <ol className="pd-stops">{c.stops.slice(0, 7).map((s, i) => <li key={i} style={{ '--c': COL[i % COL.length] } as React.CSSProperties}><b>{pad(i + 1)}</b><div><strong>{clip(s.title, 46)}</strong>{s.text && <p>{clip(s.text, 120)}</p>}</div></li>)}</ol>
      {c.food && <div className="pd-food"><b>yum!</b> {clip(c.food.name, 36)}{c.food.note ? ` — ${clip(c.food.note, 80)}` : ''}</div>}
      {c.caption && <p className="pd-cap">{clip(c.caption, 110)}</p>}
    </PageShell>
  )
}

export const playful: Own = { Cover, Intro, Items, Day }
