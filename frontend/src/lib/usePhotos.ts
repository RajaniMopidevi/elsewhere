import { useEffect, useState } from 'react'
import { fetchPhotos } from '../api'
import type { Journal, PhotoMap } from '../types'
import { photoQueries } from './pages'

/** Fetch optional destination photos once per journal. Never blocks or breaks the journal. */
export function usePhotos(journal: Journal | undefined): PhotoMap {
  const [photos, setPhotos] = useState<PhotoMap>({})
  useEffect(() => {
    setPhotos({})
    if (!journal) return
    const ctrl = new AbortController()
    fetchPhotos(photoQueries(journal), journal.destination, ctrl.signal).then((p) => {
      if (!ctrl.signal.aborted) setPhotos(p)
    })
    return () => ctrl.abort()
  }, [journal])
  return photos
}
