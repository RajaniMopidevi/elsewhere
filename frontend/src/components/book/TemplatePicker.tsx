import { useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import type { BookKind, TemplateId } from '../../lib/books'
import { TEMPLATES, templateInfo } from '../../templates/registry'
import { SAMPLE } from '../../data/sample'
import { SAMPLE_MEMORY } from '../../data/sampleMemory'
import { FitBox, FitPage, ScaledPage } from '../scrap/ScaledPage'
import { useBookPages } from './BookRenderer'

function usePreviewBook(templateId: TemplateId, kind: BookKind) {
  return useBookPages({ templateId, plan: kind === 'plan' ? SAMPLE : undefined, memory: kind === 'memory' ? SAMPLE_MEMORY : undefined, preview: true })
}

function MiniPages({ id, kind }: { id: TemplateId; kind: BookKind }) {
  const book = usePreviewBook(id, kind)
  const inner = book.pages.findIndex((p) => /Explore|Visited/.test(p.section))
  const picks = [0, inner > 0 ? inner : 1]
  return (
    <book.Provider>
      <div className="tp-mini" aria-hidden>
        <FitBox width={330} height={225}>
          <div style={{ display: 'flex', gap: 10, width: 330, height: 225 }}>
            {picks.map((i, k) => (
              <div key={i} className={`tp-mini-pg ${k ? 'second' : ''}`}><ScaledPage scale={0.2}>{book.pages[i]?.node(i + 1)}</ScaledPage></div>
            ))}
          </div>
        </FitBox>
      </div>
    </book.Provider>
  )
}

function PreviewDialog({ id, kind, onClose, onPick, selected }: { id: TemplateId; kind: BookKind; onClose: () => void; onPick: (id: TemplateId) => void; selected: boolean }) {
  const book = usePreviewBook(id, kind)
  const [i, setI] = useState(0)
  const info = templateInfo(id)
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') setI((x) => Math.min(book.pages.length - 1, x + 1)); if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1)) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [book.pages.length, onClose])
  return (
    <div className="overview-scrim" role="dialog" aria-modal="true" aria-label={`${info.name} preview`}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-display text-3xl text-paper">{info.name}</h2><p className="font-type text-xs uppercase tracking-[.18em] text-paper/60">Preview with sample content · page {i + 1} of {book.pages.length} · {book.pages[i]?.label}</p></div>
          <div className="flex gap-2">
            <button type="button" className="vbtn solid" onClick={() => { onPick(id); onClose() }}>{selected ? <Check size={15} /> : null} {selected ? 'Selected' : 'Use this style'}</button>
            <button type="button" className="vbtn" onClick={onClose} autoFocus><X size={15} /> Close</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="navarrow" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous page"><ChevronLeft size={24} /></button>
          <div className="min-w-0 flex-1" key={i}><book.Provider><FitPage fitHeight={190} maxScale={1}>{book.pages[i]?.node(i + 1)}</FitPage></book.Provider></div>
          <button type="button" className="navarrow" onClick={() => setI(Math.min(book.pages.length - 1, i + 1))} disabled={i === book.pages.length - 1} aria-label="Next page"><ChevronRight size={24} /></button>
        </div>
      </div>
    </div>
  )
}

/** Five visual systems, each shown as live miniatures of its own cover and an inner page, rendered by the real template code. */
export default function TemplatePicker({ value, onChange, kind }: { value: TemplateId; onChange: (id: TemplateId) => void; kind: BookKind }) {
  const [open, setOpen] = useState<TemplateId | null>(null)
  return (
    <div>
      <div className="tp-grid" role="radiogroup" aria-label="Scrapbook style">
        {TEMPLATES.map((t) => {
          const sel = t.id === value
          return (
            <div key={t.id} className={`tp-card ${sel ? 'sel' : ''}`} data-testid={`tpl-${t.id}`}>
              <button type="button" role="radio" aria-checked={sel} className="tp-pick" onClick={() => onChange(t.id)}>
                <MiniPages id={t.id} kind={kind} />
                <span className="tp-name">{t.name}{sel && <span className="tp-check"><Check size={14} strokeWidth={3} /> chosen</span>}</span>
                <span className="tp-tag">{t.tagline}</span>
                <span className="tp-sw" aria-hidden>{t.swatches.map((c) => <i key={c} style={{ background: c }} />)}</span>
              </button>
              <p className="tp-blurb">{t.blurb}</p>
              <button type="button" className="tp-view" onClick={() => setOpen(t.id)}><Eye size={14} aria-hidden /> Preview all pages</button>
            </div>
          )
        })}
      </div>
      <p className="mt-3 font-type text-[11px] uppercase tracking-[.16em] text-ink/55">Previews use sample content{kind === 'memory' ? ' — your own photographs will fill the “your photo” frames' : ''}. You can change the style later from the book itself.</p>
      {open && <PreviewDialog id={open} kind={kind} selected={open === value} onClose={() => setOpen(null)} onPick={onChange} />}
    </div>
  )
}

/** Compact style switcher used inside the viewer. */
export function StyleSwitcher({ value, onChange }: { value: TemplateId; onChange: (id: TemplateId) => void }) {
  return (
    <div className="style-switch" role="radiogroup" aria-label="Change style">
      {TEMPLATES.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={t.id === value} className="style-chip" onClick={() => onChange(t.id)} title={t.name}>
          <span className="sc-sw" aria-hidden>{t.swatches.slice(0, 3).map((c) => <i key={c} style={{ background: c }} />)}</span>{t.name}
        </button>
      ))}
    </div>
  )
}
