import type { ComponentType } from 'react'
import type { KitProps } from '../common'
import type { Content } from '../content'

type C<K extends Content['kind']> = Extract<Content, { kind: K }>
export interface Kit {
  Cover: ComponentType<KitProps<C<'cover'>>>
  Intro: ComponentType<KitProps<C<'intro'>>>
  Items: ComponentType<KitProps<C<'items'>>>
  Day: ComponentType<KitProps<C<'day'>>>
  Route: ComponentType<KitProps<C<'route'>>>
  Stay: ComponentType<KitProps<C<'stay'>>>
  Gallery: ComponentType<KitProps<C<'gallery'>>>
  Closing: ComponentType<KitProps<C<'closing'>>>
}
export type Own = Pick<Kit, 'Cover' | 'Intro' | 'Items' | 'Day'>
export type PC<K extends Content['kind']> = KitProps<C<K>>
