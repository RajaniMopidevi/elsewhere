/**
 * Local persistence (no server, no accounts).
 *  - `books`  store: one JSON record per saved book (metadata + generated content + photo metadata)
 *  - `blobs`  store: the photographs themselves as Blobs (original + a display copy), keyed by photo id, indexed by bookId
 * Everything lives in this browser's IndexedDB. If IndexedDB is unavailable (some private modes) the same API falls back
 * to memory for the current tab and `isPersistent()` returns false so the UI can warn.
 *
 * To move to cloud storage later, re-implement this module's exports against an API; callers do not touch IndexedDB.
 */
import type { Book } from './books'

export interface BlobRec { id: string; bookId: string; original: Blob; display: Blob }

const DB_NAME = 'elsewhere'
const DB_VERSION = 1
let dbPromise: Promise<IDBDatabase | null> | null = null
let persistent = true
const memBooks = new Map<string, Book>()
const memBlobs = new Map<string, BlobRec>()

export const isPersistent = () => persistent

function open(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('no indexedDB')
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains('books')) db.createObjectStore('books', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs', { keyPath: 'id' }).createIndex('bookId', 'bookId', { unique: false })
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => { persistent = false; resolve(null) }
      req.onblocked = () => { persistent = false; resolve(null) }
    } catch {
      persistent = false
      resolve(null)
    }
  })
  return dbPromise
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error) })
}
function done(tx: IDBTransaction): Promise<void> {
  return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error ?? new Error('Transaction aborted')) })
}

export async function listBooks(): Promise<Book[]> {
  const db = await open()
  const rows = db ? await wrap<Book[]>(db.transaction('books').objectStore('books').getAll()) : [...memBooks.values()]
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getBook(id: string): Promise<Book | null> {
  const db = await open()
  if (!db) return memBooks.get(id) ?? null
  return (await wrap<Book | undefined>(db.transaction('books').objectStore('books').get(id))) ?? null
}

/** Saves a book and (optionally) new photo blobs in ONE transaction, so a failure never leaves half a book. */
export async function saveBook(book: Book, blobs: BlobRec[] = []): Promise<void> {
  const db = await open()
  if (!db) {
    memBooks.set(book.id, book)
    blobs.forEach((b) => memBlobs.set(b.id, b))
    return
  }
  const tx = db.transaction(['books', 'blobs'], 'readwrite')
  tx.objectStore('books').put(book)
  blobs.forEach((b) => tx.objectStore('blobs').put(b))
  await done(tx)
}

export async function getBlobs(bookId: string): Promise<BlobRec[]> {
  const db = await open()
  if (!db) return [...memBlobs.values()].filter((b) => b.bookId === bookId)
  return wrap<BlobRec[]>(db.transaction('blobs').objectStore('blobs').index('bookId').getAll(bookId))
}

export async function deleteBlobs(ids: string[]): Promise<void> {
  if (!ids.length) return
  const db = await open()
  if (!db) { ids.forEach((i) => memBlobs.delete(i)); return }
  const tx = db.transaction('blobs', 'readwrite')
  ids.forEach((i) => tx.objectStore('blobs').delete(i))
  await done(tx)
}

export async function deleteBook(id: string): Promise<void> {
  const db = await open()
  if (!db) {
    memBooks.delete(id)
    for (const [k, v] of memBlobs) if (v.bookId === id) memBlobs.delete(k)
    return
  }
  const blobKeys = await wrap<IDBValidKey[]>(db.transaction('blobs').objectStore('blobs').index('bookId').getAllKeys(id))
  const tx = db.transaction(['books', 'blobs'], 'readwrite')
  tx.objectStore('books').delete(id)
  blobKeys.forEach((k) => tx.objectStore('blobs').delete(k))
  await done(tx)
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.()
    return e ? { usage: e.usage ?? 0, quota: e.quota ?? 0 } : null
  } catch { return null }
}

/** Ask the browser not to evict our data under storage pressure (best effort). */
export async function requestPersistence(): Promise<void> {
  try { await navigator.storage?.persist?.() } catch { /* ignore */ }
}
