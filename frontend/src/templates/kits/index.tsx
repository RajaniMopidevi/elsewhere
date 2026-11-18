import type { ComponentType } from 'react'
import type { TemplateId } from '../../lib/books'
import { GenericClosing, GenericGallery, GenericRoute, GenericStay } from '../shared'
import { magazine } from './magazine'
import { mono } from './mono'
import { nature } from './nature'
import { playful } from './playful'
import type { Kit, Own } from './types'
import { vintageMemory } from './vintage'

const bind = <P,>(C: ComponentType<P & { tpl: TemplateId }>, tpl: TemplateId): ComponentType<P> => {
  const B = (p: P) => <C {...p} tpl={tpl} />
  return B
}

const make = (tpl: TemplateId, own: Own): Kit => ({
  ...own,
  Route: bind(GenericRoute, tpl) as Kit['Route'],
  Stay: bind(GenericStay, tpl) as Kit['Stay'],
  Gallery: bind(GenericGallery, tpl) as Kit['Gallery'],
  Closing: bind(GenericClosing, tpl) as Kit['Closing'],
})

/** Full visual systems. 'vintage' + plan journals use the original page components (see BookRenderer). */
export const KITS: Record<TemplateId, Kit> = {
  vintage: make('vintage', vintageMemory),
  mono: make('mono', mono),
  playful: make('playful', playful),
  magazine: make('magazine', magazine),
  nature: make('nature', nature),
}
