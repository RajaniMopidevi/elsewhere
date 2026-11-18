import { Illo } from '../scrap/Illustrations'
import { RoundStamp, Tape, Squiggle } from '../scrap/Decor'
import { PageFrame, clip, useJournal } from './JournalContext'

export default function NotesPage({ n }: { n: number }) {
  const { journal: j, photos } = useJournal()
  const hasPhotos = Object.values(photos).some(Boolean)
  return (
    <PageFrame theme="t-kraft" n={n} label="Travel Notes" className="notes">
      <div className="torn small" style={{ left: 54, top: 50, width: 440 }}>
        <span className="script">before you go</span>
        <h2>Travel notes</h2>
      </div>
      <RoundStamp top="verify first" bottom="ai suggestions" center="!" className="notes-stamp" style={{ right: 48, top: 40 }} />

      <section className="sheet lined" style={{ left: 50, top: 190, width: 360, transform: 'rotate(-1.2deg)' }}>
        <Tape style={{ left: 140, top: -14 }} />
        <h3>Good to know</h3>
        <ul>{j.tips.slice(0, 6).map((t, i) => <li key={i}><span>→</span>{clip(t, 118)}</li>)}</ul>
      </section>

      <section className="sheet ticket-note" style={{ left: 52, top: 612, width: 360, transform: 'rotate(.8deg)' }}>
        <h3>Local customs</h3>
        <ul>{j.customs.slice(0, 4).map((t, i) => <li key={i}>{clip(t, 112)}</li>)}</ul>
      </section>

      <section className="sheet check" style={{ right: 50, top: 186, width: 330, transform: 'rotate(1.4deg)' }}>
        <Tape style={{ left: 120, top: -14, transform: 'rotate(4deg)' }} />
        <h3>Packing list</h3>
        <ul>{j.packing.slice(0, 10).map((t, i) => <li key={i}><i />{clip(t, 34)}</li>)}</ul>
      </section>

      <section className="sheet strip-note" style={{ right: 56, top: 612, width: 326, transform: 'rotate(-.8deg)' }}>
        <h3>Useful reminders</h3>
        <ul>{j.useful_info.slice(0, 4).map((t, i) => <li key={i}>{clip(t, 100)}</li>)}</ul>
      </section>

      <section className="my-notes">
        <h3 className="script">my notes</h3>
        <div className="lines" />
        <Illo name="plane" className="mn-plane" />
      </section>

      <p className="disclaimer">
        <b>Heads-up:</b> {clip(j.disclaimer, 260)}
        {hasPhotos && <><br />Photographs: Wikipedia &amp; Wikimedia Commons contributors, used under their respective open licences.</>}
      </p>
      <Squiggle className="notes-squig" />
    </PageFrame>
  )
}
