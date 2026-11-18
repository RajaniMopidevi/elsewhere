import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { buildPages } from '../../lib/pages'
import type { PageSpec } from '../../lib/pages'
import type { JournalResponse, PhotoMap } from '../../types'
import { JournalContext } from './JournalContext'
import PageRenderer from './PageRenderer'

export function JournalProvider({ data, photos, children }: { data: JournalResponse; photos: PhotoMap; children: ReactNode }) {
  const pages = useMemo(() => buildPages(data.journal), [data])
  const value = useMemo(() => ({ journal: data.journal, trip: data.trip, photos, total: pages.length }), [data, photos, pages.length])
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}

export function usePages(data: JournalResponse): PageSpec[] {
  return useMemo(() => buildPages(data.journal), [data])
}

export function PageView({ spec, n }: { spec: PageSpec; n: number }) {
  return <PageRenderer spec={spec} n={n} />
}
