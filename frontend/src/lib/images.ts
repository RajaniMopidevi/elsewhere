import { useEffect, useState } from 'react'
import type { BlobRec } from './db'
import type { PhotoMeta } from './books'

export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
export const MAX_FILE_MB = 30
const MAX_EDGE = 2200

export interface Processed { original: Blob; display: Blob; w: number; h: number; type: string; name: string }

function typeOf(f: File): string {
  if (ACCEPTED.includes(f.type)) return f.type
  const ext = f.name.toLowerCase().split('.').pop()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return ''
}

/**
 * Validates a file, keeps the ORIGINAL untouched, and makes a display copy (max 2200px on the long edge, EXIF orientation applied)
 * so pages and PDFs stay light without discarding the original.
 */
export async function processImage(file: File): Promise<Processed> {
  const type = typeOf(file)
  if (!type) throw new Error(`“${file.name}” is not a JPG, PNG or WebP image.`)
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`“${file.name}” is larger than ${MAX_FILE_MB} MB.`)
  let bmp: ImageBitmap
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch { throw new Error(`“${file.name}” could not be read as an image.`) }
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height))
  if (scale >= 1) {
    const out = { original: file, display: file, w: bmp.width, h: bmp.height, type, name: file.name }
    bmp.close?.()
    return out
  }
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) { bmp.close?.(); throw new Error('Your browser could not process this image.') }
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  const outType = type === 'image/png' ? 'image/png' : 'image/jpeg'
  const display: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Could not encode the image.'))), outType, 0.92))
  return { original: file, display, w, h, type, name: file.name }
}

export interface PhotoUrl { url: string; originalUrl: string; w: number; h: number }
export type PhotoUrls = Record<string, PhotoUrl>

/** Object URLs for a set of stored blobs (revoked automatically). */
export function useBlobUrls(blobs: BlobRec[] | null, metas: PhotoMeta[] | undefined): PhotoUrls {
  const [urls, setUrls] = useState<PhotoUrls>({})
  useEffect(() => {
    if (!blobs) { setUrls({}); return }
    const made: string[] = []
    const out: PhotoUrls = {}
    for (const b of blobs) {
      const m = metas?.find((x) => x.id === b.id)
      const url = URL.createObjectURL(b.display)
      const originalUrl = b.original === b.display ? url : URL.createObjectURL(b.original)
      made.push(url); if (originalUrl !== url) made.push(originalUrl)
      out[b.id] = { url, originalUrl, w: m?.w ?? 0, h: m?.h ?? 0 }
    }
    setUrls(out)
    return () => made.forEach((u) => URL.revokeObjectURL(u))
  }, [blobs]) // eslint-disable-line react-hooks/exhaustive-deps
  return urls
}
