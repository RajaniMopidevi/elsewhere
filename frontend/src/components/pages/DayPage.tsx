import { Illo } from '../scrap/Illustrations'
import { Arrow, Star } from '../scrap/Decor'
import { smooth } from '../../lib/geom'
import type { Pt } from '../../lib/geom'
import { hash, placeIllo } from '../../lib/art'
import type { Day } from '../../types'
import { PageFrame, Photo, clip, useJournal } from './JournalContext'

interface Props { n: number; day: Day; variant: number }

const pad = (d: number) => String(d).padStart(2, '0')

function Eat({ day }: { day: Day }) {
  if (!day.food_stop?.name) return null
  return (
    <div className="eat">
      <Illo name="cup" />
      <div>
        <small>eat &amp; sip</small>
        <b>{clip(day.food_stop.name, 44)}</b>
        <span>{clip(day.food_stop.note, 80)}</span>
      </div>
    </div>
  )
}

function Stop({ s, i }: { s: Day['stops'][number]; i: number }) {
  return (
    <>
      <small>{s.part || ['Morning', 'Afternoon', 'Evening', 'Late'][i]}</small>
      <h3>{clip(s.place, 40)}</h3>
      <p>{clip(s.activity, 110)}</p>
    </>
  )
}

/** v0 — greige / navy / orange: wavy path of stickers, like the day-itinerary poster. */
function Sticker({ n, day }: Props) {
  const { journal } = useJournal()
  const total = journal.days.length
  const n4 = day.stops.length >= 4
  const rowH = n4 ? 120 : 156
  const gap = n4 ? 26 : 40
  const half = n4 ? 59 : 75
  const cy = (i: number) => 330 + rowH / 2 + i * (rowH + gap)
  const cx = (i: number) => (i % 2 ? 669 : 125)
  const pathD = day.stops
    .slice(1)
    .map((_, k) => {
      const i = k
      const y1 = cy(i) + half + 4, y2 = cy(i + 1) - half - 4, mid = (y1 + y2) / 2
      return `M${cx(i)} ${y1} C${cx(i)} ${mid + 18}, ${cx(i + 1)} ${mid - 18}, ${cx(i + 1)} ${y2}`
    })
    .join(' ')
  return (
    <PageFrame theme="t-greige" n={n} label={`Day ${day.day}`} className="day day-sticker">
      <div className="blob white" style={{ left: -40, top: 150, width: 330, height: 200 }} />
      <div className="blob pink" style={{ right: -30, bottom: 180, width: 360, height: 190 }} />
      <div className="dh">
        <span className="script big">day {pad(day.day)}</span>
        <div>
          <h2>{clip(day.title, 48)}</h2>
          <small>{clip(day.area, 34)} · {day.day} of {total}</small>
        </div>
      </div>
      <p className="dh-intro">{clip(day.intro, 170)}</p>
      <svg className="d-path" viewBox="0 0 794 1123" aria-hidden>
        <path d={pathD} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" />
      </svg>
      <div className="d-stops" data-n={day.stops.length >= 4 ? 4 : 3}>
        {day.stops.map((s, i) => (
          <article key={i} className={`d-stop ${i % 2 ? 'r' : 'l'}`}>
            <div className="sticker-wrap">
              <div className="sticker"><Illo name={placeIllo(s.place, '', i + day.day)} /></div>
              <span className="dot" />
            </div>
            <div className="d-text"><Stop s={s} i={i} /></div>
          </article>
        ))}
      </div>
      <Eat day={day} />
      <div className="d-caption"><Illo name="camera" /><span>{clip(day.caption, 110)}</span></div>
    </PageFrame>
  )
}

/** v1 — mustard / red block / white marker route (magazine spread reference). */
function Magazine({ n, day }: Props) {
  const { journal } = useJournal()
  const first = day.stops[0]
  const xs = [120, 290, 130, 280]
  const pts: Pt[] = day.stops.map((_, i, a) => [xs[i % 4], 230 + (a.length === 1 ? 0.5 : i / (a.length - 1)) * 560])
  return (
    <PageFrame theme="t-mustard" n={n} label={`Day ${day.day}`} className="day day-mag">
      <div className="mag-head"><span>pag. {pad(n)}</span><b>day {day.day} of {journal.days.length}</b><span>{clip(day.area, 26)}</span></div>
      <div className="red-block tall">
        <Illo name={placeIllo(first?.place ?? day.title, '', day.day)} className="red-illo" />
        <svg className="loop" viewBox="0 0 380 900" aria-hidden>
          <path filter="url(#rough)" d={smooth([[60, 880], ...pts, [330, 860 - 40]] as Pt[])} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill="#e24c4a" stroke="#fff" strokeWidth="6" />)}
        </svg>
        {pts.map(([x, y], i) => (
          <span key={i} className="marker route-label" style={{ left: x > 200 ? undefined : x + 22, right: x > 200 ? 380 - x + 22 : undefined, top: y - 20, textAlign: x > 200 ? 'right' : 'left' }}>
            {clip(day.stops[i].place, 22).toUpperCase()}
          </span>
        ))}
        <span className="marker" style={{ left: 18, top: 22, fontSize: 42, transform: 'rotate(-3deg)' }}>DAY {day.day}</span>
      </div>

      <figure className="inset-photo">
        <Photo name={first?.place} illo={placeIllo(first?.place ?? '', '', day.day)} />
        <figcaption>{clip(first?.place, 40)}</figcaption>
      </figure>

      <div className="mag-col day-col">
        <div className="kicker">THE DAILY JOURNEY</div>
        <h2>{clip(day.title, 44)}</h2>
        <p className="deck">{clip(day.intro, 170)}</p>
        <ol className="mag-stops">
          {day.stops.map((s, i) => (
            <li key={i}><em>{s.part || ['Morning', 'Afternoon', 'Evening', 'Late'][i]}</em> <b>{clip(s.place, 38)}</b><span>{clip(s.activity, 110)}</span></li>
          ))}
        </ol>
        {day.food_stop?.name && <p className="mag-eat">➤ <b>{clip(day.food_stop.name, 40)}</b> — {clip(day.food_stop.note, 70)}</p>}
        <blockquote>{clip(day.caption, 120)}</blockquote>
      </div>
      <span className="pull" style={{ top: 930, left: 470 }}>{clip(journal.annotations[day.day % Math.max(1, journal.annotations.length)] ?? 'keep wandering', 36)}</span>
    </PageFrame>
  )
}

/** v2 — cream / maroon / pink: lettered tiles over a pink street sketch (walking-trail reference). */
function Trail({ n, day }: Props) {
  const { journal } = useJournal()
  const seed = hash(journal.destination + day.day)
  const lines = Array.from({ length: 11 }, (_, i) => {
    const a = (seed >> (i % 9)) % 97
    return `M${40 + ((a * 7 + i * 61) % 700)} ${20 + ((a * 13 + i * 47) % 380)} l${60 + (a % 120)} ${((a * 3) % 90) - 30} l${20 + (a % 60)} ${40 + (a % 70)}`
  })
  const letters = day.stops.map((_, i) => String.fromCharCode(65 + i))
  return (
    <PageFrame theme="t-cream" n={n} label={`Day ${day.day}`} className="day day-trail">
      <div className="frame-dash" />
      <div className="dt-head">
        <small>DAY {day.day} · {clip(day.area, 28)}</small>
        <h2>{clip(day.title, 46)}</h2>
        <p>{clip(day.intro, 170)}</p>
      </div>
      <svg className="street-map" viewBox="0 0 794 420" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity=".5">
          {lines.map((l, i) => <path key={i} d={l} />)}
        </g>
        <g fill="none" stroke="var(--hl)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round"><path d="M80 300C220 80 380 380 520 200S700 120 740 220" /></g>
      </svg>
      <div className="dt-grid">
        {day.stops.map((s, i) => (
          <article key={i} className="dt-card">
            <div className="dt-art"><span className="pin">{letters[i]}</span><Illo name={placeIllo(s.place, '', i + day.day)} /></div>
            <small>{s.part || ['Morning', 'Afternoon', 'Evening', 'Late'][i]}</small>
            <h3>{clip(s.place, 38)}</h3>
            <p>{clip(s.activity, 100)}</p>
          </article>
        ))}
        {day.stops.length < 4 && day.food_stop?.name && (
          <article className="dt-card">
            <div className="dt-art"><span className="pin">★</span><Illo name="cup" /></div>
            <small>Eat &amp; sip</small>
            <h3>{clip(day.food_stop.name, 38)}</h3>
            <p>{clip(day.food_stop.note, 100)}</p>
          </article>
        )}
      </div>
      <div className="routes">
        <b>Route</b>
        <div className="route-line">
          <span>Start</span>
          {day.stops.map((s, i) => (
            <span key={i}><Arrow className="ar" />{letters[i]} {clip(s.place, 18)}</span>
          ))}
          {day.food_stop?.name && <span><Arrow className="ar" />Eat: {clip(day.food_stop.name, 20)}</span>}
        </div>
        {day.food_stop?.name && <p className="dt-eat"><Star className="mini" /> {clip(day.food_stop.note || day.food_stop.name, 80)}</p>}
        <p className="dt-cap">“{clip(day.caption, 120)}”</p>
      </div>
    </PageFrame>
  )
}

export default function DayPage(props: Props) {
  if (props.variant === 1) return <Magazine {...props} />
  if (props.variant === 2) return <Trail {...props} />
  return <Sticker {...props} />
}
