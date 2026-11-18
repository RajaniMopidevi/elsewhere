import { Illo } from '../scrap/Illustrations'
import { Gingham, Postage, RoundStamp, Tape, Ticket, Squiggle } from '../scrap/Decor'
import { heroIllo } from '../../lib/art'
import { tripLength } from '../../lib/pages'
import { PageFrame, Photo, clip, useJournal } from './JournalContext'

export default function CoverPage({ n }: { n: number }) {
  const { journal: j, trip } = useJournal()
  const dest = j.destination.toUpperCase()
  const size = Math.max(34, Math.min(128, Math.floor(600 / (dest.length * 0.8))))
  const hero = heroIllo(j.destination, j.country, j.design)
  const note = j.annotations[0] ?? 'the adventure begins'
  return (
    <PageFrame theme="t-kraft" n={n} label="Cover" className="cover" noFolio>
      <svg className="cover-lines" viewBox="0 0 794 1123" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".35">
          <path d="M-20 300C150 240 300 330 460 270S720 200 830 260" strokeDasharray="2 7" />
          <path d="M-20 880C200 820 330 960 520 900S740 840 830 900" strokeDasharray="2 7" />
          {[160, 320, 480, 640].map((x) => <path key={x} d={`M${x} 0V1123`} opacity=".25" />)}
          {[200, 420, 640, 860].map((y) => <path key={y} d={`M0 ${y}H794`} opacity=".25" />)}
          <ellipse cx="400" cy="560" rx="360" ry="220" strokeDasharray="1 6" />
        </g>
      </svg>
      <Gingham style={{ left: -34, bottom: 70, width: 250, height: 190, transform: 'rotate(-9deg)' }} />
      <Tape style={{ left: 40, bottom: 210, transform: 'rotate(-30deg)' }} />

      <Postage value={tripLength(trip)} style={{ left: 46, top: 44, transform: 'rotate(-5deg)' }}>
        <Illo name={hero} />
      </Postage>
      <Postage value="AIR MAIL" className="alt" style={{ left: 196, top: 84, transform: 'rotate(4deg)' }}>
        <Illo name="plane" />
      </Postage>
      <RoundStamp top={j.destination} bottom={j.country || 'journal'} center="✈" className="cover-stamp" style={{ right: 44, top: 36 }} />

      <div className="torn" style={{ left: 64, top: 268, width: 666 }}>
        <span className="script">my travel journal</span>
        <h1 style={{ fontSize: size }}>{dest}</h1>
        <p>{clip(j.title, 60)}</p>
      </div>

      <Ticket title="ADMIT ONE" lines={[tripLength(trip), trip.travel_dates ? clip(trip.travel_dates, 22) : 'any season']} style={{ left: 56, top: 590, transform: 'rotate(-6deg)' }} />
      <Illo name="camera" className="cover-hero" />

      <figure className="polaroid" style={{ right: 56, top: 538, transform: 'rotate(4deg)' }}>
        <Tape style={{ left: 96, top: -16, transform: 'rotate(-4deg)' }} />
        <Photo name={j.destination} illo={hero} />
        <figcaption>{clip(note, 30)}</figcaption>
      </figure>

      <div className="strips">
        <div className="strip" style={{ transform: 'rotate(-1deg)', marginLeft: 20 }}>{clip(j.subtitle, 80)}</div>
        <div className="strip small" style={{ transform: 'rotate(.8deg)', marginLeft: 12 }}>
          we travel not to escape life, but for life not to escape us
        </div>
      </div>
      <Squiggle className="cover-squig" />
    </PageFrame>
  )
}
