import { Illo } from '../scrap/Illustrations'
import { Gingham, RoundStamp, Tape, VerifyTag } from '../scrap/Decor'
import { hash } from '../../lib/art'
import { PageFrame, clip, useJournal } from './JournalContext'

export default function StayPage({ n }: { n: number }) {
  const { journal: j } = useJournal()
  const areas = j.stay_areas.slice(0, 3)
  const stays = j.stays.slice(0, 3)
  return (
    <PageFrame theme="t-kraft" n={n} label="Where to Stay" className="stay">
      <Gingham style={{ right: -40, top: -20, width: 220, height: 150, transform: 'rotate(12deg)' }} />
      <div className="torn small" style={{ left: 54, top: 54, width: 480 }}>
        <span className="script">rest your head</span>
        <h2>Where to stay</h2>
      </div>
      <RoundStamp top="check-in" bottom={j.destination} center="★" className="stay-stamp" style={{ right: 50, top: 52 }} />

      <div className="stay-body">
        <div className="passes">
          {areas.length === 0 && <div className="pass"><div className="pass-main"><h3>Choose a central base</h3><p>Pick somewhere well connected to the places you marked on the map.</p></div></div>}
          {areas.map((a, i) => (
            <div key={i} className="pass" style={{ transform: `rotate(${(hash(a.name) % 5) / 2 - 1.2}deg)`, marginLeft: i * 14 }}>
              <div className="pass-main">
                <small>area {i + 1} · {clip(a.vibe, 40)}</small>
                <h3>{clip(a.name, 34)}</h3>
                <p>{clip(a.why, 150)}</p>
              </div>
              <div className="pass-stub"><b>BEST FOR</b><span>{clip(a.best_for || 'most travellers', 40)}</span></div>
            </div>
          ))}
        </div>

        {stays.length > 0 ? (
          <div className="stays">
            {stays.map((s, i) => (
              <figure key={i} className="stay-card" style={{ transform: `rotate(${i === 1 ? 1.5 : i === 0 ? -2 : 2.5}deg)` }}>
                <Tape style={{ left: 70, top: -12, transform: 'rotate(-5deg)' }} />
                <Illo name={i % 2 ? 'bed' : 'hotel'} />
                <figcaption>
                  <small>{clip(s.style || 'stay', 24)}{s.area ? ` · ${clip(s.area, 18)}` : ''}</small>
                  <h4>{clip(s.name, 34)}</h4>
                  <p>{clip(s.description, 90)}</p>
                  <VerifyTag />
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="no-stays">
            <Illo name="hotel" />
            <p>No specific hotels this time — pick a place that suits your budget inside the areas above.</p>
          </div>
        )}

        <div className="stay-note">
          <b>practical note</b>
          <p>{clip(j.stay_notes || 'Book a base close to public transport, and always check recent reviews and availability yourself.', 240)}</p>
          <span className="hand">{clip(j.annotations[3] ?? 'sleep well, wander far', 40)}</span>
        </div>
      </div>
    </PageFrame>
  )
}
