import { Illo } from '../scrap/Illustrations'
import { Compass } from '../scrap/Decor'
import { hash, placeIllo } from '../../lib/art'
import { smooth } from '../../lib/geom'
import { mapStops, tripLength } from '../../lib/pages'
import { PageFrame, clip, useJournal } from './JournalContext'

const W = 700
const H = 700

function rng(seed: number) {
  let s = seed || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function points(seed: number, n: number): [number, number][] {
  const r = rng(seed)
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1)
    const y = 70 + t * (H - 140)
    const x = W / 2 + Math.sin(t * Math.PI * 2.1 + (seed % 7)) * (W * 0.28) + (r() - 0.5) * 50
    pts.push([Math.max(95, Math.min(W - 95, x)), y])
  }
  return pts
}

function landPath(seed: number): string {
  const r = rng(seed + 11)
  const n = 16
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rad = 0.82 + r() * 0.2
    pts.push([W / 2 + Math.cos(a) * (W * 0.46) * rad, H / 2 + Math.sin(a) * (H * 0.47) * rad])
  }
  const closed = [...pts, pts[0], pts[1]]
  return smooth(closed) + 'Z'
}

/** Put each cluster bubble in the corner slot that is furthest from every pin. */
function pickSlots(pts: [number, number][], count: number): [number, number][] {
  const cand: [number, number][] = [[4, 4], [W - 196, 4], [4, H - 104], [W - 196, H - 104], [W / 2 - 98, H - 104], [W / 2 - 98, 4]]
  const left = [...cand]
  const out: [number, number][] = []
  for (let k = 0; k < count; k++) {
    let best = 0, bestScore = -1
    left.forEach((c, i) => {
      const cx = c[0] + 98, cy = c[1] + 45
      // consider the pin AND the text label that extends sideways from it
      const probe = pts.flatMap(([x, y]) => [[x, y], [x < W / 2 ? x + 90 : x - 90, y], [x < W / 2 ? x + 180 : x - 180, y]])
      const score = Math.min(...probe.map(([px, py]) => Math.hypot(px - cx, (py - cy) * 1.4)), 999)
      if (score > bestScore) { bestScore = score; best = i }
    })
    out.push(left.splice(best, 1)[0])
  }
  return out
}

export default function MapPage({ n }: { n: number }) {
  const { journal: j, trip } = useJournal()
  const stops = mapStops(j)
  const seed = hash(j.destination)
  const pts = points(seed, stops.length)
  const clusters = j.route.clusters.slice(0, 3)
  const slots = pickSlots(pts, clusters.length)
  const info = (name: string) => j.places.find((p) => p.name.toLowerCase() === name.toLowerCase())
  return (
    <PageFrame theme="t-grid" n={n} label="The Map" className="mappage">
      <div className="map-title">
        <span className="script">let's have a trip</span>
        <h2>The Route</h2>
        <p>{j.destination} · {tripLength(trip)}</p>
      </div>
      <Compass className="map-compass" />
      <div className="map-note">illustrative sketch,<br />not a live map — not to scale</div>

      <div className="mapbox">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-label={`Illustrated route through ${j.destination}`}>
          <g filter="url(#rough-lg)">
            <path className="river" d="M-20 120C120 60 230 170 330 130S560 40 740 110l0 60C560 100 440 210 330 190S110 120-20 190z" />
            <path className="river" d="M470 -10C520 120 420 230 480 350S600 520 560 660l-70 0C530 520 410 420 400 330S430 120 400 -10z" opacity=".75" />
          </g>
          <path className="land" d={landPath(seed)} filter="url(#rough-lg)" />
          <path className="route-under" d={smooth(pts)} />
          <path className="route" d={smooth(pts)} filter="url(#rough-lg)" />
          {pts.map(([x, y], i) => {
            const right = x < W / 2
            return (
              <g key={i} className="pin">
                <circle cx={x} cy={y} r="17" className="pin-dot" />
                <text x={x} y={y + 6} textAnchor="middle" className="pin-n">{i + 1}</text>
                <text x={right ? x + 26 : x - 26} y={y + 6} textAnchor={right ? 'start' : 'end'} className="pin-label">{clip(stops[i], 24)}</text>
              </g>
            )
          })}
        </svg>
        {pts.length > 0 && (
          <>
            <span className="flag" style={{ left: pts[0][0] - 46, top: pts[0][1] - 60 }}>start ✈</span>
            <span className="flag" style={{ left: pts[pts.length - 1][0] - 30, top: pts[pts.length - 1][1] + 24 }}>finish</span>
          </>
        )}
        {pts.map(([x, y], i) =>
          i % 3 === 1 ? (
            <div key={`d${i}`} className="map-doodle-wrap" style={{ left: x < W / 2 ? Math.max(2, x - 112) : x + 40, top: y - 86 }}>
              <Illo name={placeIllo(stops[i], info(stops[i])?.kind, i)} />
            </div>
          ) : null,
        )}
        {clusters.map((c, i) => (
          <div key={i} className="bubble" style={{ left: slots[i]?.[0], top: slots[i]?.[1] }}>
            <b>{clip(c.name, 26)}</b>
            <span>{clip(c.places.slice(0, 3).join(' · '), 60)}</span>
          </div>
        ))}
      </div>

      <div className="legend">
        <p className="legend-sum">{clip(j.route.summary, 190)}</p>
        <ol>
          {stops.map((s, i) => (
            <li key={i}><span>{i + 1}</span>{clip(s, 30)}</li>
          ))}
        </ol>
      </div>
    </PageFrame>
  )
}
