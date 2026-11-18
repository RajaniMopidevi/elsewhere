import type { JournalResponse } from '../types'

/** Everything the app stores about a saved book. Photos' binary data lives in a separate IndexedDB store (see db.ts). */
export type TemplateId = 'vintage' | 'mono' | 'playful' | 'magazine' | 'nature'
export type BookKind = 'plan' | 'memory'
export type BookStatus = 'upcoming' | 'completed'
export type PhotoSection = 'auto' | 'cover' | 'journey' | 'place' | 'food' | 'day' | 'keep'
export type CollageLayout = 'auto' | 'hero' | 'grid' | 'scatter' | 'strip'
export type LayoutSection = 'cover' | 'journey' | 'places' | 'food' | 'days' | 'keep'

export interface PhotoMeta {
  id: string
  name: string            // original file name
  type: string            // original MIME type
  w: number               // natural size of the stored display copy
  h: number
  caption: string
  section: PhotoSection
  place?: string          // when section === 'place'
  day?: number            // when section === 'day'
  fit?: 'cover' | 'contain'
  order: number
}

export interface MemoryInput {
  destination: string
  dates?: string
  days?: number
  companions: string[]
  places: { name: string; day?: number; note?: string }[]
  activities: { text: string; day?: number }[]
  food: { name: string; note?: string }[]
  moments: string[]
  experiences: string[]
  notes?: string
}

export interface MemoryText {
  title: string
  subtitle: string
  intro: string
  why_memorable: string
  places: { name: string; caption: string; annotation: string }[]
  food: { name: string; caption: string }[]
  days: { day: number; title: string; summary: string }[]
  highlights: string[]
  closing_note: string
  annotations: string[]
  design?: { region: string; mood: string; motifs: string[] }
  photo_plan: { cover: string[]; journey: string[]; food: string[]; keep: string[]; places: Record<string, string[]>; days: Record<string, string[]> }
}

export interface MemoryData {
  input: MemoryInput
  text: MemoryText
  photos: PhotoMeta[]
  layouts: Partial<Record<LayoutSection, CollageLayout>>
  aiWritten: boolean      // false when the book was built from the traveller's own words only
}

export interface Book {
  id: string
  kind: BookKind
  status: BookStatus
  templateId: TemplateId
  title: string
  destination: string
  datesLabel: string
  createdAt: string
  updatedAt: string
  plan?: JournalResponse
  memory?: MemoryData
  linkedPlanId?: string     // memory book made from a plan
  memoryBookId?: string     // plan whose trip was completed
}

export const newId = (): string => {
  try { if (crypto?.randomUUID) return crypto.randomUUID() } catch { /* fall through */ }
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export const nowIso = () => new Date().toISOString()

export function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return iso.slice(0, 10) }
}

export function planDatesLabel(trip: JournalResponse['trip']): string {
  const d = `${trip.days} ${trip.days === 1 ? 'day' : 'days'}`
  return trip.travel_dates ? `${trip.travel_dates} · ${d}` : d
}

export function bookFromPlan(res: JournalResponse, templateId: TemplateId): Book {
  const t = nowIso()
  return {
    id: newId(), kind: 'plan', status: 'upcoming', templateId, title: res.journal.title, destination: res.journal.destination,
    datesLabel: planDatesLabel(res.trip),
    createdAt: t, updatedAt: t, plan: res,
  }
}

export function memoryDatesLabel(i: MemoryInput): string {
  const parts = [i.dates, i.days ? `${i.days} ${i.days === 1 ? 'day' : 'days'}` : ''].filter(Boolean)
  return parts.join(' · ')
}

export function bookFromMemory(memory: MemoryData, templateId: TemplateId, linkedPlanId?: string): Book {
  const t = nowIso()
  return {
    id: newId(), kind: 'memory', status: 'completed', templateId, title: memory.text.title, destination: memory.input.destination,
    datesLabel: memoryDatesLabel(memory.input), createdAt: t, updatedAt: t, memory, linkedPlanId,
  }
}
