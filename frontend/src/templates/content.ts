/**
 * Template-independent page content. Both plan journals and memory books are turned into the SAME list of
 * `PageDef`s here; each template (src/templates/kits) then lays those pages out in its own visual system.
 */
import type { Journal, JournalResponse, PhotoMap } from '../types'
import type { CollageLayout, LayoutSection, MemoryData, PhotoMeta } from '../lib/books'
import { memoryDatesLabel } from '../lib/books'
import type { PhotoUrls } from '../lib/images'
import { foodIllo, heroIllo, motifsFrom, placeIllo } from '../lib/art'
import type { IlloName } from '../lib/art'
import { mapStops } from '../lib/pages'

export interface Img { src: string; caption?: string; alt?: string; fit?: 'cover' | 'contain'; credit?: string; placeholder?: boolean }
export interface Item { title: string; kicker?: string; text?: string; note?: string; imgs: Img[]; illo: IlloName; verify?: boolean }
export interface DayStop { part?: string; title: string; text?: string }

export type Content =
  | { kind: 'cover'; title: string; subtitle?: string; dates?: string; people?: string; photos: Img[]; layout: CollageLayout }
  | { kind: 'intro'; eyebrow: string; heading: string; deck?: string; body: string; why?: string; people?: string[]; listTitle?: string; list: string[]; kv: { k: string; v: string }[]; photos: Img[]; layout: CollageLayout }
  | { kind: 'route'; heading: string; summary?: string; stops: string[]; clusters: { name: string; places: string[]; note?: string }[] }
  | { kind: 'items'; variant: 'places' | 'food'; heading: string; sub?: string; items: Item[]; startIndex: number; photos: Img[]; layout: CollageLayout }
  | { kind: 'stay'; heading: string; areas: { name: string; vibe?: string; why?: string; best_for?: string }[]; stays: { name: string; area?: string; style?: string; description?: string }[]; note?: string }
  | { kind: 'day'; day: number; title: string; area?: string; intro?: string; stops: DayStop[]; food?: { name: string; note?: string }; caption?: string; photos: Img[]; layout: CollageLayout }
  | { kind: 'gallery'; heading: string; sub?: string; photos: Img[]; layout: CollageLayout }
  | { kind: 'closing'; heading: string; blocks: { title: string; items: string[]; check?: boolean }[]; noteTitle?: string; note?: string; photos: Img[]; layout: CollageLayout; notesLines: boolean; disclaimer?: string }

export interface PageDef { id: string; label: string; section: string; c: Content }

export interface BookMeta {
  mode: 'plan' | 'memory'
  destination: string
  country: string
  title: string
  dates: string
  hero: IlloName
  motifs: IlloName[]
  annotations: string[]
  total: number
  preview: boolean
  credits: boolean
}

const chunk = <T,>(a: T[], n: number): T[][] => { const o: T[][] = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o }
const ph = (n: number): Img[] => Array.from({ length: n }, (_, i) => ({ src: '', placeholder: true, caption: i === 0 ? '' : '' }))

// ------------------------------------------------------------------------------------------------ plan
export function buildPlanContent(res: JournalResponse, wiki: PhotoMap, preview = false): { pages: PageDef[]; meta: BookMeta } {
  const j: Journal = res.journal
  const trip = res.trip
  const days = `${trip.days} ${trip.days === 1 ? 'day' : 'days'}`
  const dates = trip.travel_dates ? `${trip.travel_dates} · ${days}` : days
  const img = (name?: string): Img | null => { const p = name ? wiki[name] : null; return p ? { src: p.url, alt: p.title, credit: p.credit } : null }
  const hero = heroIllo(j.destination, j.country, j.design)
  const motifs = motifsFrom(j.design)
  const destImg = img(j.destination)
  const pages: PageDef[] = []
  const add = (id: string, label: string, section: string, c: Content) => pages.push({ id, label, section, c })

  add('cover', 'Cover', 'Cover', { kind: 'cover', title: j.title, subtitle: j.subtitle, dates, photos: destImg ? [destImg] : [], layout: 'auto' })
  add('intro', 'The Destination', 'Destination', { kind: 'intro', eyebrow: 'The destination', heading: j.destination, deck: j.editorial, body: j.intro, listTitle: 'Did you know', list: j.facts, kv: [], photos: destImg ? [destImg] : [], layout: 'auto' })
  add('route', 'The Map', 'Map', { kind: 'route', heading: 'The route', summary: j.route.summary, stops: mapStops(j), clusters: j.route.clusters })
  chunk(j.places, 4).forEach((items, i, all) =>
    add(`places-${i}`, 'Places to Explore', 'Explore', {
      kind: 'items', variant: 'places', heading: 'Places to explore', sub: all.length > 1 ? `part ${i + 1} of ${all.length}` : 'the shortlist', startIndex: i * 4, photos: [], layout: 'auto',
      items: items.map((p, k) => ({ title: p.name, kicker: p.area || p.kind, text: p.description, note: p.note, imgs: img(p.name) ? [img(p.name)!] : [], illo: placeIllo(p.name, p.kind, k), verify: p.needs_verification })),
    }))
  chunk(j.food, 4).forEach((items, i, all) =>
    add(`food-${i}`, 'Food & Cafés', 'Taste', {
      kind: 'items', variant: 'food', heading: 'Food & cafés', sub: all.length > 1 ? `part ${i + 1} of ${all.length}` : `a taste trail through ${j.destination}`, startIndex: i * 4, photos: [], layout: 'auto',
      items: items.map((f, k) => ({ title: f.name, kicker: [f.category === 'cafe' ? 'café' : f.category, f.area].filter(Boolean).join(' · '), text: f.description, note: f.note, imgs: img(f.name) ? [img(f.name)!] : [], illo: foodIllo(f.name, f.category, k), verify: f.needs_verification })),
    }))
  if (j.stay_areas.length || j.stays.length)
    add('stay', 'Where to Stay', 'Stay', { kind: 'stay', heading: 'Where to stay', areas: j.stay_areas, stays: j.stays, note: j.stay_notes })
  j.days.forEach((d) => {
    const dayImgs = d.stops.map((s) => img(s.place)).filter((x): x is Img => !!x).slice(0, 2)
    add(`day-${d.day}`, `Day ${d.day}`, 'The Journey', {
      kind: 'day', day: d.day, title: d.title, area: d.area, intro: d.intro, caption: d.caption,
      stops: d.stops.map((s) => ({ part: s.part, title: s.place, text: s.activity })),
      food: d.food_stop?.name ? { name: d.food_stop.name, note: d.food_stop.note } : undefined, photos: dayImgs, layout: 'auto',
    })
  })
  add('notes', 'Travel Notes', 'Notes', {
    kind: 'closing', heading: 'Travel notes', notesLines: true, noteTitle: 'My notes', photos: [], layout: 'auto', disclaimer: j.disclaimer,
    blocks: [
      { title: 'Good to know', items: j.tips }, { title: 'Local customs', items: j.customs },
      { title: 'Useful reminders', items: j.useful_info }, { title: 'Packing list', items: j.packing, check: true },
    ].filter((b) => b.items.length),
  })
  if (preview) pages.forEach((p) => { if ('photos' in p.c && p.c.photos.length === 0 && (p.c.kind === 'cover' || p.c.kind === 'intro')) p.c.photos = ph(p.c.kind === 'cover' ? 2 : 1) })
  return { pages, meta: { mode: 'plan', destination: j.destination, country: j.country, title: j.title, dates, hero, motifs, annotations: j.annotations, total: pages.length, preview, credits: Object.values(wiki).some(Boolean) } }
}

// ------------------------------------------------------------------------------------------------ memory
interface Assigned { cover: PhotoMeta[]; journey: PhotoMeta[]; food: PhotoMeta[]; keep: PhotoMeta[]; foodItems: Map<string, PhotoMeta[]>; places: Map<string, PhotoMeta[]>; days: Map<number, PhotoMeta[]> }
const norm = (s?: string) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()

/** Explicit choices made by the traveller always win; then the AI's (caption-based) hints; then simple caption matching; the rest is spread without guessing. */
export function assignPhotos(m: MemoryData): Assigned {
  const a: Assigned = { cover: [], journey: [], food: [], keep: [], foodItems: new Map(), places: new Map(), days: new Map() }
  const photos = [...m.photos].sort((x, y) => x.order - y.order)
  const placeKeys = new Map(m.input.places.map((p) => [norm(p.name), p.name]))
  const foodKeys = new Map(m.input.food.map((f) => [norm(f.name), f.name]))
  const push = <K,>(map: Map<K, PhotoMeta[]>, k: K, p: PhotoMeta) => map.set(k, [...(map.get(k) ?? []), p])
  const plan = m.text.photo_plan
  const hintFor = (p: PhotoMeta) => {
    for (const k of ['cover', 'journey', 'food', 'keep'] as const) if (plan?.[k]?.includes(p.id)) return () => a[k].push(p)
    for (const [name, ids] of Object.entries(plan?.places ?? {})) if (ids.includes(p.id) && placeKeys.has(norm(name))) return () => push(a.places, placeKeys.get(norm(name))!, p)
    for (const [d, ids] of Object.entries(plan?.days ?? {})) if (ids.includes(p.id)) return () => push(a.days, Number(d), p)
    return null
  }
  const pool: PhotoMeta[] = []
  for (const p of photos) {
    if (p.section === 'cover') a.cover.push(p)
    else if (p.section === 'journey') a.journey.push(p)
    else if (p.section === 'keep') a.keep.push(p)
    else if (p.section === 'food') (p.place && foodKeys.has(norm(p.place)) ? push(a.foodItems, foodKeys.get(norm(p.place))!, p) : a.food.push(p))
    else if (p.section === 'place') (p.place && placeKeys.has(norm(p.place)) ? push(a.places, placeKeys.get(norm(p.place))!, p) : a.keep.push(p))
    else if (p.section === 'day') (p.day ? push(a.days, p.day, p) : a.keep.push(p))
    else {
      // The traveller's own words (captions naming a place, dish or day) beat the AI's hint; the hint only places what is still unlabelled.
      const cap = norm(p.caption)
      const place = cap ? [...placeKeys].find(([k]) => cap.includes(k)) : undefined
      const food = cap ? [...foodKeys].find(([k]) => cap.includes(k)) : undefined
      const day = cap.match(/\bday\s*(\d{1,2})\b/)
      if (place) push(a.places, place[1], p)
      else if (food) push(a.foodItems, food[1], p)
      else if (day) push(a.days, Number(day[1]), p)
      else { const h = hintFor(p); if (h) { h(); continue } pool.push(p) }
    }
  }
  // Unlabelled photos: a few for the cover, a couple for "our journey", the rest are keepsakes. No guessing which place they belong to.
  const nCover = a.cover.length ? 0 : pool.length >= 6 ? 3 : pool.length >= 3 ? 2 : Math.min(1, pool.length)
  a.cover.push(...pool.splice(0, nCover))
  if (!a.journey.length) a.journey.push(...pool.splice(0, pool.length >= 4 ? 2 : 0))
  a.keep.push(...pool)
  // The cover should always show a real photograph if the traveller gave us any: when none was assigned to it, re-use (not move) their first one.
  if (!a.cover.length && photos.length) a.cover.push(photos.find((p) => p.section !== 'food') ?? photos[0])
  return a
}

export function buildMemoryContent(m: MemoryData, urls: PhotoUrls, preview = false): { pages: PageDef[]; meta: BookMeta } {
  const t = m.text, inp = m.input
  const L = (s: LayoutSection): CollageLayout => m.layouts[s] ?? 'auto'
  const mk = (p: PhotoMeta): Img => ({ src: urls[p.id]?.url ?? '', caption: p.caption || undefined, fit: p.fit ?? 'cover', alt: p.caption || `Photo from ${inp.destination}` })
  const A = assignPhotos(preview ? { ...m, photos: [] } : m)
  const imgs = (ps: PhotoMeta[] | undefined, fallback = 0): Img[] => (ps?.length ? ps.map(mk) : preview ? ph(fallback) : [])
  const pages: PageDef[] = []
  const add = (id: string, label: string, section: string, c: Content) => pages.push({ id, label, section, c })
  const overflow: { label: string; photos: Img[] }[] = []
  const take = (ps: Img[], cap: number, label: string): Img[] => { if (ps.length > cap) overflow.push({ label, photos: ps.slice(cap) }); return ps.slice(0, cap) }

  const dates = memoryDatesLabel(inp)
  const people = inp.companions.length ? `with ${inp.companions.length > 1 ? inp.companions.slice(0, -1).join(', ') + ' & ' + inp.companions[inp.companions.length - 1] : inp.companions[0]}` : undefined
  const hero = heroIllo(inp.destination, '', t.design)
  add('cover', 'Cover', 'Cover', { kind: 'cover', title: t.title, subtitle: t.subtitle || undefined, dates, people, photos: take(imgs(A.cover, 3), 3, 'the cover'), layout: L('cover') })

  const kv = [{ k: 'Where', v: inp.destination }, ...(inp.dates ? [{ k: 'When', v: inp.dates }] : []), ...(inp.days ? [{ k: 'How long', v: `${inp.days} ${inp.days === 1 ? 'day' : 'days'}` }] : []), { k: 'Places', v: String(inp.places.length) }]
  add('journey', 'Our Journey', 'Our Journey', {
    kind: 'intro', eyebrow: 'Our journey', heading: inp.destination, deck: t.subtitle || undefined, body: t.intro, why: t.why_memorable || undefined,
    people: inp.companions, listTitle: 'Places we visited', list: inp.places.map((p) => p.name).slice(0, 10), kv, photos: take(imgs(A.journey, 2), 4, 'our journey'), layout: L('journey'),
  })

  const placeItems = inp.places.map((p, i) => {
    const ai = t.places.find((x) => norm(x.name) === norm(p.name))
    const ph2 = A.places.get(p.name) ?? []
    return { it: { title: p.name, kicker: p.day ? `Day ${p.day}` : undefined, text: ai?.caption || p.note || undefined, note: ai?.annotation || undefined, imgs: take(imgs(ph2, 1), 3, p.name), illo: placeIllo(p.name, '', i) } as Item }
  })
  chunk(placeItems.map((x) => x.it), 3).forEach((items, i, all) =>
    add(`places-${i}`, 'Places We Visited', 'Visited', { kind: 'items', variant: 'places', heading: 'Places we visited', sub: all.length > 1 ? `part ${i + 1} of ${all.length}` : 'where we went', items, startIndex: i * 3, photos: [], layout: L('places') }))

  const foodPhotos = A.food
  if (inp.food.length || foodPhotos.length || A.foodItems.size) {
    const fItems = inp.food.map((f, i) => {
      const ai = t.food.find((x) => norm(x.name) === norm(f.name))
      return { title: f.name, text: ai?.caption || f.note || undefined, imgs: take(imgs(A.foodItems.get(f.name), 0), 2, f.name), illo: foodIllo(f.name, '', i) } as Item
    })
    const chunks = fItems.length ? chunk(fItems, 4) : [[] as Item[]]
    const fp = take(imgs(foodPhotos, 2), 4, 'the food page')
    chunks.forEach((items, i, all) =>
      add(`food-${i}`, 'The Food We Remember', 'Taste', { kind: 'items', variant: 'food', heading: 'The food we remember', sub: all.length > 1 ? `part ${i + 1} of ${all.length}` : 'tastes & cafés', items, startIndex: i * 4, photos: i === 0 ? fp : [], layout: L('food') }))
  }

  const dayNums = Array.from(new Set([...(t.days.map((d) => d.day)), ...inp.places.map((p) => p.day), ...inp.activities.map((a) => a.day), ...A.days.keys()].filter((d): d is number => !!d))).sort((x, y) => x - y)
  for (const d of dayNums) {
    const ai = t.days.find((x) => x.day === d)
    const stops: DayStop[] = [
      ...inp.places.filter((p) => p.day === d).map((p) => ({ part: 'Visited', title: p.name, text: t.places.find((x) => norm(x.name) === norm(p.name))?.caption || p.note || undefined })),
      ...inp.activities.filter((a) => a.day === d).map((a) => ({ part: 'We', title: a.text })),
    ]
    add(`day-${d}`, `Day ${d}`, 'Our Days', { kind: 'day', day: d, title: ai?.title || `Day ${d}`, intro: ai?.summary || undefined, stops, photos: take(imgs(A.days.get(d), 2), 4, `day ${d}`), layout: L('days') })
  }

  const keep = take(imgs(A.keep, 5), 6, 'memories to keep')
  const split = inp.moments.length
  const hl = t.highlights.length ? t.highlights : [...inp.moments, ...inp.experiences]
  const blocks = [
    { title: 'Favourite moments', items: hl.slice(0, split) },
    { title: 'Memorable experiences', items: hl.slice(split) },
    { title: 'In our own words', items: inp.notes ? [inp.notes] : [] },
  ].filter((b) => b.items.length)
  overflow.forEach((o, i) => chunk(o.photos, 8).forEach((ps, k) => add(`gallery-${i}-${k}`, 'More Moments', 'Gallery', { kind: 'gallery', heading: 'More moments', sub: `from ${o.label}`, photos: ps, layout: 'grid' })))
  add('keep', 'Memories to Keep', 'Keepsakes', { kind: 'closing', heading: 'Memories to keep', blocks, noteTitle: t.closing_note ? 'A note to remember it by' : undefined, note: t.closing_note || undefined, photos: keep, layout: L('keep'), notesLines: !t.closing_note })
  // Move the keepsake page to the very end (galleries come before it).
  return { pages, meta: { mode: 'memory', destination: inp.destination, country: '', title: t.title, dates, hero, motifs: motifsFrom(t.design), annotations: t.annotations, total: pages.length, preview, credits: false } }
}

/** Fallback text when Gemini is unavailable: the traveller's own words only, nothing added. */
export function plainMemoryText(inp: MemoryData['input']): MemoryData['text'] {
  return {
    title: `${inp.destination}, remembered`,
    subtitle: [inp.dates, inp.days ? `${inp.days} ${inp.days === 1 ? 'day' : 'days'}` : ''].filter(Boolean).join(' · '),
    intro: '', why_memorable: '',
    places: inp.places.map((p) => ({ name: p.name, caption: p.note ?? '', annotation: '' })),
    food: inp.food.map((f) => ({ name: f.name, caption: f.note ?? '' })),
    days: [], highlights: [], closing_note: '', annotations: [],
    photo_plan: { cover: [], journey: [], food: [], keep: [], places: {}, days: {} },
  }
}
