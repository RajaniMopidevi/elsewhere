import { useRef, useState } from 'react'
import { ImagePlus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { ACCEPT_ATTR, MAX_FILE_MB, processImage } from '../../lib/images'
import type { CollageLayout, LayoutSection, MemoryInput, PhotoMeta } from '../../lib/books'
import { newId } from '../../lib/books'

export interface DraftPhoto { meta: PhotoMeta; original: Blob; display: Blob; url: string; isNew: boolean }
export const MAX_PHOTOS = 80

const SECTIONS: { key: LayoutSection; label: string }[] = [
  { key: 'cover', label: 'Cover' }, { key: 'journey', label: 'Our journey' }, { key: 'places', label: 'Places we visited' },
  { key: 'food', label: 'The food we remember' }, { key: 'days', label: 'Our days' }, { key: 'keep', label: 'Memories to keep' },
]
const LAYOUTS: { key: CollageLayout; label: string }[] = [
  { key: 'auto', label: 'Auto' }, { key: 'hero', label: 'One big + small' }, { key: 'grid', label: 'Grid' }, { key: 'scatter', label: 'Scattered' }, { key: 'strip', label: 'Film strip' },
]

/** "auto" | "cover" | "journey" | "keep" | "place:Alfama" | "food:Pastel" | "day:2" */
export const encodeTarget = (p: PhotoMeta): string => (p.section === 'place' ? `place:${p.place ?? ''}` : p.section === 'food' && p.place ? `food:${p.place}` : p.section === 'day' ? `day:${p.day ?? ''}` : p.section)
export function applyTarget(p: PhotoMeta, v: string): PhotoMeta {
  const [kind, rest] = [v.split(':')[0], v.slice(v.indexOf(':') + 1)]
  const base = { ...p, place: undefined, day: undefined }
  if (kind === 'place') return { ...base, section: 'place', place: rest }
  if (kind === 'food' && v.includes(':')) return { ...base, section: 'food', place: rest }
  if (kind === 'day') return { ...base, section: 'day', day: Number(rest) || undefined }
  return { ...base, section: v as PhotoMeta['section'] }
}

export default function PhotoStudio({ photos, setPhotos, input, layouts, setLayouts }: {
  photos: DraftPhoto[]; setPhotos: (fn: (p: DraftPhoto[]) => DraftPhoto[]) => void; input: MemoryInput
  layouts: Partial<Record<LayoutSection, CollageLayout>>; setLayouts: (l: Partial<Record<LayoutSection, CollageLayout>>) => void
}) {
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  async function add(list: FileList | File[]) {
    const files = Array.from(list)
    if (!files.length) return
    setBusy(true)
    const errs: string[] = []
    const made: DraftPhoto[] = []
    const room = MAX_PHOTOS - photos.length
    for (const f of files.slice(0, Math.max(0, room))) {
      try {
        const pr = await processImage(f)
        const id = newId()
        made.push({ isNew: true, original: pr.original, display: pr.display, url: URL.createObjectURL(pr.display), meta: { id, name: pr.name, type: pr.type, w: pr.w, h: pr.h, caption: '', section: 'auto', order: 0 } })
      } catch (e) { errs.push((e as Error).message) }
    }
    if (files.length > room) errs.push(`You can add up to ${MAX_PHOTOS} photographs; ${files.length - room} were not added.`)
    setPhotos((cur) => [...cur, ...made].map((p, i) => ({ ...p, meta: { ...p.meta, order: i } })))
    setErrors(errs)
    setBusy(false)
    if (file.current) file.current.value = ''
  }
  const update = (id: string, patch: Partial<PhotoMeta>) => setPhotos((cur) => cur.map((p) => (p.meta.id === id ? { ...p, meta: { ...p.meta, ...patch } } : p)))
  const remove = (id: string) => setPhotos((cur) => { const v = cur.find((p) => p.meta.id === id); if (v) URL.revokeObjectURL(v.url); return cur.filter((p) => p.meta.id !== id).map((p, i) => ({ ...p, meta: { ...p.meta, order: i } })) })
  const move = (i: number, d: number) => setPhotos((cur) => { const a = [...cur]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a.map((p, k) => ({ ...p, meta: { ...p.meta, order: k } })) })

  const dayCount = Math.max(input.days ?? 0, ...input.places.map((p) => p.day ?? 0), ...input.activities.map((a) => a.day ?? 0), 0) || 7

  return (
    <div className="grid gap-5">
      <div
        className={`ps-drop ${drag ? 'over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void add(e.dataTransfer.files) }}
      >
        <ImagePlus size={30} aria-hidden />
        <p className="font-display text-2xl">Drop your photographs here</p>
        <p className="text-sm text-ink/70">JPG, JPEG, PNG or WebP · up to {MAX_FILE_MB} MB each · {photos.length}/{MAX_PHOTOS} added</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => file.current?.click()} disabled={busy || photos.length >= MAX_PHOTOS}>{busy ? 'Reading photos…' : 'Choose photos'}</button>
        <input ref={file} id="photo-input" data-testid="photo-input" type="file" multiple accept={ACCEPT_ATTR} className="sr-only" aria-label="Upload photographs" onChange={(e) => e.target.files && void add(e.target.files)} />
        <p className="text-xs text-ink/60">Your originals are kept exactly as they are, in this browser only. They are never uploaded to a server or to the AI.</p>
      </div>
      {errors.length > 0 && <ul role="alert" className="rounded border-2 border-coral bg-[#fde8e4] px-4 py-3 text-sm text-[#7a1d14]">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}

      {photos.length > 0 && (
        <>
          <ul className="ps-grid" aria-label="Your photographs">
            {photos.map((p, i) => (
              <li key={p.meta.id} className="ps-card" data-testid="photo-card">
                <div className="ps-thumb"><img src={p.url} alt={p.meta.caption || p.meta.name} style={{ objectFit: p.meta.fit === 'contain' ? 'contain' : 'cover' }} /></div>
                <input className="input !py-2 !text-sm" aria-label={`Caption for ${p.meta.name}`} placeholder="Add a caption (optional)" maxLength={120} value={p.meta.caption} onChange={(e) => update(p.meta.id, { caption: e.target.value })} />
                <label className="ps-sel"><span>Appears on</span>
                  <select aria-label={`Page for ${p.meta.name}`} value={encodeTarget(p.meta)} onChange={(e) => setPhotos((cur) => cur.map((x) => (x.meta.id === p.meta.id ? { ...x, meta: applyTarget(x.meta, e.target.value) } : x)))}>
                    <option value="auto">Let Elsewhere place it</option>
                    <option value="cover">Cover</option>
                    <option value="journey">Our journey</option>
                    {input.places.length > 0 && <optgroup label="A place we visited">{input.places.map((pl) => <option key={pl.name} value={`place:${pl.name}`}>{pl.name}</option>)}</optgroup>}
                    <optgroup label="The food we remember"><option value="food">Food page (general)</option>{input.food.map((f) => <option key={f.name} value={`food:${f.name}`}>{f.name}</option>)}</optgroup>
                    <optgroup label="Our days">{Array.from({ length: dayCount }, (_, k) => <option key={k} value={`day:${k + 1}`}>Day {k + 1}</option>)}</optgroup>
                    <option value="keep">Memories to keep</option>
                  </select>
                </label>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={p.meta.fit === 'contain'} onChange={(e) => update(p.meta.id, { fit: e.target.checked ? 'contain' : 'cover' })} /> Show whole photo</label>
                  <span className="flex gap-1">
                    <button type="button" className="ml-x" aria-label={`Move ${p.meta.name} earlier`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
                    <button type="button" className="ml-x" aria-label={`Move ${p.meta.name} later`} disabled={i === photos.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
                    <button type="button" className="ml-x" aria-label={`Remove ${p.meta.name}`} onClick={() => remove(p.meta.id)}><Trash2 size={14} /></button>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <fieldset className="m-0 border-0 p-0">
            <legend className="field-label">Collage layout <span className="field-opt">per page type</span></legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SECTIONS.map((s) => (
                <label key={s.key} className="flex items-center justify-between gap-3 rounded border-2 border-ink/30 bg-white/50 px-3 py-2 text-sm">
                  <span>{s.label}</span>
                  <select aria-label={`Collage layout for ${s.label}`} value={layouts[s.key] ?? 'auto'} onChange={(e) => setLayouts({ ...layouts, [s.key]: e.target.value as CollageLayout })}>
                    {LAYOUTS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
    </div>
  )
}
