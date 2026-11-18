import { Plus, X } from 'lucide-react'

export interface Field { key: string; label: string; placeholder?: string; width?: 'wide' | 'narrow'; type?: 'text' | 'number'; max?: number }

/** A small editable list ("add another") used by the memory questions. Rows are plain records of strings. */
export default function ItemList({ rows, onChange, fields, addLabel, id, maxRows = 25, empty }: {
  rows: Record<string, string>[]; onChange: (r: Record<string, string>[]) => void; fields: Field[]; addLabel: string; id: string; maxRows?: number; empty: Record<string, string>
  }) {
  const set = (i: number, k: string, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <div className="grid gap-3">
      {rows.map((r, i) => (
        <div key={i} className="ml-row" role="group" aria-label={`${addLabel} ${i + 1}`}>
          {fields.map((f) => (
            <label key={f.key} className={`ml-f ${f.width === 'narrow' ? 'narrow' : ''}`}>
              <span className="sr-only">{f.label} {i + 1}</span>
              <input
                id={`${id}-${f.key}-${i}`} className="input" type={f.type ?? 'text'} min={f.type === 'number' ? 1 : undefined} max={f.type === 'number' ? 30 : undefined}
                value={r[f.key] ?? ''} placeholder={f.placeholder ?? f.label} maxLength={f.max ?? 200} onChange={(e) => set(i, f.key, e.target.value)}
              />
            </label>
          ))}
          <button type="button" className="ml-x" aria-label={`Remove entry ${i + 1}`} onClick={() => onChange(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ ...empty }])}><X size={16} /></button>
        </div>
      ))}
      {rows.length < maxRows && (
        <button type="button" className="fchip self-start" onClick={() => onChange([...rows, { ...empty }])}><Plus size={14} aria-hidden /> {addLabel}</button>
      )}
    </div>
  )
}
