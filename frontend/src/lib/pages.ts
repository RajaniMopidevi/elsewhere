import type { Day, FoodItem, Journal, Place, TripRequest } from '../types'

export type PageSpec =
  | { id: string; kind: 'cover'; label: string }
  | { id: string; kind: 'destination'; label: string }
  | { id: string; kind: 'map'; label: string }
  | { id: string; kind: 'places'; label: string; items: Place[]; part: number; parts: number }
  | { id: string; kind: 'food'; label: string; items: FoodItem[] }
  | { id: string; kind: 'stay'; label: string }
  | { id: string; kind: 'day'; label: string; day: Day; variant: number }
  | { id: string; kind: 'notes'; label: string }

export const PLACES_PER_PAGE = 4

export function buildPages(j: Journal): PageSpec[] {
  const pages: PageSpec[] = [
    { id: 'cover', kind: 'cover', label: 'Cover' },
    { id: 'destination', kind: 'destination', label: 'The Destination' },
    { id: 'map', kind: 'map', label: 'The Map' },
  ]
  const chunks: Place[][] = []
  for (let i = 0; i < j.places.length; i += PLACES_PER_PAGE) chunks.push(j.places.slice(i, i + PLACES_PER_PAGE))
  chunks.forEach((items, i) =>
    pages.push({ id: `places-${i}`, kind: 'places', label: 'Places to Explore', items, part: i, parts: chunks.length }),
  )
  pages.push({ id: 'food', kind: 'food', label: 'Food & Cafés', items: j.food.slice(0, 8) })
  pages.push({ id: 'stay', kind: 'stay', label: 'Where to Stay' })
  j.days.forEach((d, i) => pages.push({ id: `day-${d.day}`, kind: 'day', label: `Day ${d.day}`, day: d, variant: i % 3 }))
  pages.push({ id: 'notes', kind: 'notes', label: 'Travel Notes' })
  return pages
}

export function sectionOf(p: PageSpec): string {
  switch (p.kind) {
    case 'places': return 'Explore'
    case 'day': return 'The Journey'
    case 'food': return 'Taste'
    case 'stay': return 'Stay'
    case 'notes': return 'Notes'
    case 'cover': return 'Cover'
    case 'destination': return 'Destination'
    default: return 'Map'
  }
}

/** Queries to look up photos for (destination + top places). Kept small on purpose. */
export function photoQueries(j: Journal): string[] {
  const names = [j.destination, ...j.places.slice(0, 8).map((p) => p.name), ...j.food.slice(0, 3).map((f) => f.name)]
  return Array.from(new Set(names)).slice(0, 12)
}

export function tripLength(t: TripRequest): string {
  return `${t.days} ${t.days === 1 ? 'day' : 'days'}`
}

export function mapStops(j: Journal): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  const push = (n: string) => {
    const k = n.trim().toLowerCase()
    if (n.trim() && !seen.has(k)) { seen.add(k); out.push(n.trim()) }
  }
  j.route.order.forEach(push)
  if (out.length < 4) j.days.forEach((d) => d.stops.forEach((s) => push(s.place)))
  if (out.length < 4) j.places.forEach((p) => push(p.name))
  return out.slice(0, 10)
}
