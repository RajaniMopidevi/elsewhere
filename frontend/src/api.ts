import type { JournalResponse, PhotoMap, TripRequest } from './types'
import type { MemoryText } from './lib/books'

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '' // empty = same origin, proxied by Vite

export class ApiError extends Error {
  code: string
  status: number
  fields?: Record<string, string>
  constructor(message: string, code: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.code = code
    this.status = status
    this.fields = fields
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    const e = body?.error
    if (e?.message) return new ApiError(e.message, e.code ?? 'error', res.status, e.fields)
  } catch {
    /* not JSON */
  }
  if (res.status === 502 || res.status === 503 || res.status === 504)
    return new ApiError('The backend is not responding. Make sure it is running on port 8000 (see the README).', 'unreachable', res.status)
  return new ApiError(`Unexpected error (${res.status}). Please try again.`, 'error', res.status)
}

async function request(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(BASE + path, init)
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err
    throw new ApiError(
      'Could not reach the backend. Make sure it is running (uvicorn on port 8000) and try again.',
      'network',
      0,
    )
  }
}

export async function generateJournal(trip: TripRequest, signal?: AbortSignal): Promise<JournalResponse> {
  const res = await request('/api/journal/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip),
    signal,
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as JournalResponse
}

export async function fetchPhotos(queries: string[], context: string, signal?: AbortSignal): Promise<PhotoMap> {
  try {
    const res = await request('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries, context }),
      signal,
    })
    if (!res.ok) return {}
    return ((await res.json()) as { photos: PhotoMap }).photos ?? {}
  } catch {
    return {} // photos are optional
  }
}

export async function checkHealth(): Promise<{ ok: boolean; keyConfigured: boolean }> {
  try {
    const res = await request('/api/health', { method: 'GET' })
    if (!res.ok) return { ok: false, keyConfigured: false }
    const body = await res.json()
    return { ok: true, keyConfigured: !!body.gemini_key_configured }
  } catch {
    return { ok: false, keyConfigured: false }
  }
}

export interface MemoryRequestBody {
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
  /** metadata only; the images themselves never leave the browser */
  photos: { id: string; caption?: string; section: string; place?: string; day?: number }[]
}

export async function generateMemory(body: MemoryRequestBody, signal?: AbortSignal): Promise<{ memory: MemoryText }> {
  const res = await request('/api/memories/generate', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal,
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as { memory: MemoryText }
}
