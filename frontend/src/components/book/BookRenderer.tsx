import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { JournalResponse, PhotoMap } from '../../types'
import type { MemoryData, TemplateId } from '../../lib/books'
import type { PhotoUrls } from '../../lib/images'
import { buildPages, sectionOf } from '../../lib/pages'
import { JournalProvider, PageView } from '../pages/Provider'
import { buildMemoryContent, buildPlanContent } from '../../templates/content'
import type { BookMeta, PageDef } from '../../templates/content'
import { KITS } from '../../templates/kits'

export interface BookPage { id: string; label: string; section: string; node: (n: number) => ReactNode }
export interface BookPages { pages: BookPage[]; Provider: (p: { children: ReactNode }) => ReactNode; meta?: BookMeta }

export interface BookSource {
  templateId: TemplateId
  plan?: JournalResponse
  memory?: MemoryData
  wiki?: PhotoMap
  urls?: PhotoUrls
  preview?: boolean
}

export function ContentPage({ def, meta, n, tpl }: { def: PageDef; meta: BookMeta; n: number; tpl: TemplateId }) {
  const K = KITS[tpl]
  const p = { m: meta, n, label: def.label, section: def.section }
  const c = def.c
  switch (c.kind) {
    case 'cover': return <K.Cover c={c} {...p} />
    case 'intro': return <K.Intro c={c} {...p} />
    case 'route': return <K.Route c={c} {...p} />
    case 'items': return <K.Items c={c} {...p} />
    case 'stay': return <K.Stay c={c} {...p} />
    case 'day': return <K.Day c={c} {...p} />
    case 'gallery': return <K.Gallery c={c} {...p} />
    case 'closing': return <K.Closing c={c} {...p} />
  }
}

const EMPTY_WIKI: PhotoMap = {}
const EMPTY_URLS: PhotoUrls = {}

/**
 * One place that turns a book + template into pages.
 *  - plan + vintage  → the original hand-built journal pages (unchanged look)
 *  - everything else → the normalised page model rendered by that template's kit
 */
export function useBookPages(src: BookSource): BookPages {
  const { templateId, plan, memory, preview } = src
  const wiki = src.wiki ?? EMPTY_WIKI
  const urls = src.urls ?? EMPTY_URLS
  return useMemo(() => {
    if (plan && templateId === 'vintage') {
      const specs = buildPages(plan.journal)
      return {
        pages: specs.map((s) => ({ id: s.id, label: s.label, section: sectionOf(s), node: (n: number) => <PageView spec={s} n={n} /> })),
        Provider: ({ children }) => <JournalProvider data={plan} photos={wiki}>{children}</JournalProvider>,
      }
    }
    const built = plan ? buildPlanContent(plan, wiki, preview) : buildMemoryContent(memory!, urls, preview)
    return {
      meta: built.meta,
      pages: built.pages.map((d) => ({ id: d.id, label: d.label, section: d.section, node: (n: number) => <ContentPage def={d} meta={built.meta} n={n} tpl={templateId} /> })),
      Provider: ({ children }) => <>{children}</>,
    }
  }, [templateId, plan, memory, wiki, urls, preview])
}
