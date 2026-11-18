import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Book } from './books'
import * as db from './db'

interface Library {
  books: Book[]
  ready: boolean
  persistent: boolean
  save: (book: Book, blobs?: db.BlobRec[]) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<Library | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [ready, setReady] = useState(false)
  const [persistent, setPersistent] = useState(true)

  const refresh = useCallback(async () => {
    try { setBooks(await db.listBooks()) } catch { setBooks([]) }
    setPersistent(db.isPersistent())
    setReady(true)
  }, [])
  useEffect(() => { void refresh(); void db.requestPersistence() }, [refresh])

  const save = useCallback(async (book: Book, blobs: db.BlobRec[] = []) => {
    await db.saveBook({ ...book, updatedAt: new Date().toISOString() }, blobs)
    await refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    const all = await db.listBooks()
    const victim = all.find((b) => b.id === id)
    await db.deleteBook(id)
    // A plan whose memory book is deleted goes back to "upcoming".
    const plan = victim?.linkedPlanId ? all.find((b) => b.id === victim.linkedPlanId) : undefined
    if (plan) await db.saveBook({ ...plan, status: 'upcoming', memoryBookId: undefined, updatedAt: new Date().toISOString() })
    await refresh()
  }, [refresh])

  const value = useMemo(() => ({ books, ready, persistent, save, remove, refresh }), [books, ready, persistent, save, remove, refresh])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLibrary(): Library {
  const c = useContext(Ctx)
  if (!c) throw new Error('useLibrary outside LibraryProvider')
  return c
}
