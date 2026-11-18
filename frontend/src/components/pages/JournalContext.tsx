import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Journal, PhotoInfo, PhotoMap, TripRequest } from '../../types'
import { Illo } from '../scrap/Illustrations'
import type { IlloName } from '../../lib/art'

export interface JournalCtx {
  journal: Journal
  trip: TripRequest
  photos: PhotoMap
  total: number
}

export const JournalContext = createContext<JournalCtx | null>(null)

export function useJournal(): JournalCtx {
  const c = useContext(JournalContext)
  if (!c) throw new Error('useJournal must be used inside <JournalContext.Provider>')
  return c
}

export function usePhoto(name: string | undefined): PhotoInfo | null {
  const { photos } = useJournal()
  return name ? photos[name] ?? null : null
}

/** Photograph when we have one (and it loads), otherwise the hand-drawn illustration. */
export function Photo({ name, illo, className = '', alt }: { name?: string; illo: IlloName; className?: string; alt?: string }) {
  const info = usePhoto(name)
  const [failed, setFailed] = useState(false)
  if (!info || failed) {
    return (
      <div className={`photo-fallback ${className}`}>
        <Illo name={illo} />
      </div>
    )
  }
  return (
    <img
      className={`photo ${className}`}
      src={info.url}
      alt={alt ?? info.title}
      loading="eager"
      referrerPolicy="no-referrer"
      data-credit={info.credit}
      onError={() => setFailed(true)}
    />
  )
}

export function PageFrame({
  theme, n, label, className = '', children, noFolio,
}: { theme: string; n: number; label: string; className?: string; children: ReactNode; noFolio?: boolean }) {
  const { total } = useJournal()
  return (
    <section className={`page ${theme} ${className}`} aria-label={`Page ${n}: ${label}`}>
      <div className="paper-grain" aria-hidden />
      {children}
      {!noFolio && (
        <div className="folio" aria-hidden>
          <span>{String(n).padStart(2, '0')}</span>
          <i />
          <span>{label}</span>
          <i />
          <span>{n}/{total}</span>
        </div>
      )}
    </section>
  )
}

export const clip = (s: string | undefined, n: number) => {
  const t = (s ?? '').trim()
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t
}
