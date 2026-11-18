import { Illo } from '../scrap/Illustrations'
import { Arrow } from '../scrap/Decor'
import { heroIllo } from '../../lib/art'
import { PageFrame, Photo, clip, useJournal } from './JournalContext'

export default function DestinationPage({ n }: { n: number }) {
  const { journal: j } = useJournal()
  const hero = heroIllo(j.destination, j.country, j.design)
  const dest = j.destination.toUpperCase()
  const fs = Math.max(24, Math.min(58, Math.floor(330 / (dest.length * 0.78))))
  return (
    <PageFrame theme="t-mustard" n={n} label="The Destination" className="destination">
      <div className="mag-head"><span>pag. {String(n).padStart(2, '0')}</span><b>the destination</b><span>{j.country || 'journal'}</span></div>

      <div className="red-block">
        <Illo name={hero} className="red-illo" />
        <svg className="loop" viewBox="0 0 380 640" aria-hidden>
          <path filter="url(#rough)" d="M40 560 C 120 520, 130 470, 70 450 S 40 380, 150 380 S 300 420, 330 330 S 290 230, 340 170" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="40" cy="560" r="12" fill="none" stroke="#fff" strokeWidth="6" />
          <circle cx="340" cy="170" r="12" fill="none" stroke="#fff" strokeWidth="6" />
        </svg>
        <span className="marker" style={{ left: 18, top: 24, fontSize: 30, transform: 'rotate(-3deg)' }}>{clip(j.destination, 18)}</span>
        <span className="marker" style={{ left: 66, bottom: 34, fontSize: 28 }}>{clip(j.country || 'start here', 18)}</span>
        <span className="marker small" style={{ right: 22, bottom: 150, transform: 'rotate(-4deg)', maxWidth: 140, textAlign: 'right' }}>{clip(j.annotations[1] ?? 'wander slowly', 34)}</span>
      </div>

      <figure className="inset-photo">
        <Photo name={j.destination} illo={hero} />
        <figcaption>{clip(j.annotations[2] ?? `${j.destination}, as we imagine it`, 44)}</figcaption>
      </figure>

      <div className="mag-col">
        <div className="kicker">TRAVEL · CITY TRIP · NOTEBOOK</div>
        <h2 style={{ fontSize: fs }}>{dest}</h2>
        <p className="deck">{clip(j.editorial, 230)}</p>
        <p className="body dropcap">{clip(j.intro, 520)}</p>
      </div>

      <span className="pull" style={{ top: 690 }}>{clip(j.annotations[4] ?? j.annotations[0] ?? 'wander slowly', 40)}</span>

      <div className="facts">
        <div className="facts-title">did you know<Arrow className="facts-arrow" /></div>
        {j.facts.slice(0, 4).map((f, i) => (
          <div className="fact" key={i}>
            <span className="marker-num">{i + 1}</span>
            <p>{clip(f, 120)}</p>
          </div>
        ))}
      </div>
    </PageFrame>
  )
}
