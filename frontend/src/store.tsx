import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { JournalResponse, TripRequest } from './types'
import { SAMPLE } from './data/sample'

interface Store {
  result: JournalResponse | null
  isSample: boolean
  draft: TripRequest | null
  setResult: (r: JournalResponse) => void
  openSample: () => void
  setDraft: (d: TripRequest) => void
  clearResult: () => void
}

const Ctx = createContext<Store | null>(null)
const KEY = 'elsewhere:session'

function load(): { result: JournalResponse | null; draft: TripRequest | null } {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage unavailable */ }
  return { result: null, draft: null }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(load, [])
  const [result, setResultState] = useState<JournalResponse | null>(initial.result)
  const [draft, setDraftState] = useState<TripRequest | null>(initial.draft)
  const [isSample, setIsSample] = useState(false)

  const persist = (r: JournalResponse | null, d: TripRequest | null) => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ result: r, draft: d })) } catch { /* ignore */ }
  }

  const setResult = useCallback((r: JournalResponse) => {
    setResultState(r); setIsSample(false); persist(r, r.trip); setDraftState(r.trip)
  }, [])
  const setDraft = useCallback((d: TripRequest) => { setDraftState(d); persist(result, d) }, [result])
  const openSample = useCallback(() => { setResultState(SAMPLE); setIsSample(true) }, [])
  const clearResult = useCallback(() => { setResultState(null); setIsSample(false); persist(null, draft) }, [draft])

  const value = useMemo(
    () => ({ result, isSample, draft, setResult, openSample, setDraft, clearResult }),
    [result, isSample, draft, setResult, openSample, setDraft, clearResult],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore outside StoreProvider')
  return c
}
