import { Illo } from '../scrap/Illustrations'
import { Star, VerifyTag } from '../scrap/Decor'
import { placeIllo } from '../../lib/art'
import { PLACES_PER_PAGE } from '../../lib/pages'
import type { Place } from '../../types'
import { PageFrame, Photo, clip } from './JournalContext'

interface Props { n: number; items: Place[]; part: number; parts: number }

/** Greige / navy / orange "sticker route" layout (itinerary-poster reference). */
function PathLayout({ n, items, part, parts }: Props) {
  const centres = items.map((_, i) => [i % 2 === 0 ? 160 : 634, 290 + i * 220] as const)
  let d = ''
  centres.forEach(([x, y], i) => {
    d += i === 0 ? `M${x} ${y}` : ` C${x} ${y - 90}, ${centres[i - 1][0]} ${y - 130}, ${x} ${y}`
  })
  return (
    <PageFrame theme="t-greige" n={n} label="Places to Explore" className="places-path">
      <div className="blob pink" style={{ left: 420, top: 30, width: 300, height: 120 }} />
      <div className="pp-head">
        <span className="script">places to explore</span>
        <small>{parts > 1 ? `part ${part + 1} of ${parts}` : 'the shortlist'}</small>
      </div>
      <svg className="pp-path" viewBox="0 0 794 1123" aria-hidden>
        {centres.length > 1 && <path d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" />}
      </svg>
      {items.map((p, i) => {
        const left = i % 2 === 0
        const num = part * PLACES_PER_PAGE + i + 1
        return (
          <article key={i} className={`pp-item ${left ? 'l' : 'r'}`} style={{ top: 190 + i * 220 }}>
            <div className={`blob ${i % 2 ? 'navy' : 'white'}`} />
            <div className="sticker-wrap">
              <div className="sticker">
                <Photo name={p.name} illo={placeIllo(p.name, p.kind, i)} />
              </div>
              <span className="dot">{num}</span>
            </div>
            <div className="pp-text">
              <small>{clip(p.area || p.kind, 30)}</small>
              <h3>{clip(p.name, 44)}</h3>
              <p>{clip(p.description, 170)}</p>
              {p.note && <em className="hand-note">{clip(p.note, 46)}</em>}
              {p.needs_verification && <VerifyTag />}
            </div>
          </article>
        )
      })}
      <Illo name="camera" className="pp-camera" />
    </PageFrame>
  )
}

/** Cream / maroon / pink framed grid layout (walking-trail reference). */
function GridLayout({ n, items, part, parts }: Props) {
  const cells = [...items]
  while (cells.length < 4) cells.push(null as unknown as Place)
  return (
    <PageFrame theme="t-cream" n={n} label="Places to Explore" className="places-grid">
      <div className="frame-dash" />
      <div className="pg-head">
        <Star className="s1" /><Star className="s2" />
        <h2>Places to<br />Explore</h2>
        <p>{parts > 1 ? `part ${part + 1} of ${parts} · ` : ''}a walking trail of memories &amp; forgotten treasures</p>
      </div>
      <div className="pg-grid">
        {cells.map((p, i) =>
          p ? (
            <article key={i} className="pg-cell">
              <span className="pin">{String.fromCharCode(65 + part * PLACES_PER_PAGE + i)}</span>
              <div className="pg-art"><Photo name={p.name} illo={placeIllo(p.name, p.kind, i)} /></div>
              <small>{clip(p.area || p.kind, 28)}</small>
              <h3>{clip(p.name, 40)}</h3>
              <p>{clip(p.description, 150)}</p>
              {p.note && <em className="hand-note">{clip(p.note, 44)}</em>}
              {p.needs_verification && <VerifyTag />}
            </article>
          ) : (
            <div key={i} className="pg-cell filler"><Illo name={(['sun', 'camera', 'plane', 'boat'] as const)[i % 4]} /></div>
          ),
        )}
      </div>
    </PageFrame>
  )
}

export default function PlacesPage(props: Props) {
  return props.part % 2 === 0 ? <PathLayout {...props} /> : <GridLayout {...props} />
}
