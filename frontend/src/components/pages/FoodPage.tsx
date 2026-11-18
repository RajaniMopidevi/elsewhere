import { Illo } from '../scrap/Illustrations'
import { Star, VerifyTag } from '../scrap/Decor'
import { foodIllo } from '../../lib/art'
import type { FoodItem } from '../../types'
import { PageFrame, Photo, clip, useJournal } from './JournalContext'

export default function FoodPage({ n, items }: { n: number; items: FoodItem[] }) {
  const { journal: j } = useJournal()
  const cells: (FoodItem | 'title' | null)[] = ['title', ...items.slice(0, 8)]
  while (cells.length < 9) cells.push(null)
  return (
    <PageFrame theme="t-cream" n={n} label="Food & Cafés" className="food">
      <div className="frame-dash" />
      <div className="food-grid">
        {cells.map((c, i) => {
          if (c === 'title')
            return (
              <div key={i} className="food-cell title-cell">
                <Star className="s1" />
                <h2>Food<br />&amp;<br />Cafés</h2>
                <p>a taste trail through {j.destination}</p>
                <Star className="s2" />
              </div>
            )
          if (!c)
            return (
              <div key={i} className="food-cell filler">
                <Illo name={(['cup', 'bowl', 'cake', 'plate'] as const)[i % 4]} />
              </div>
            )
          const cat = (c.category || 'dish').toLowerCase()
          return (
            <article key={i} className="food-cell">
              <div className="food-art"><Photo name={c.name} illo={foodIllo(c.name, c.category, i)} /></div>
              <span className="chip">{cat === 'cafe' ? 'café' : cat}</span>
              <h3>{clip(c.name, 34)}</h3>
              {c.area && <small>{clip(c.area, 26)}</small>}
              <p>{clip(c.description, 120)}</p>
              {c.note && <em className="hand-note">{clip(c.note, 36)}</em>}
              {c.needs_verification && <VerifyTag />}
            </article>
          )
        })}
      </div>
    </PageFrame>
  )
}
