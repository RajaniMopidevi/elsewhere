import type { TemplateId } from '../lib/books'

export interface TemplateInfo {
  id: TemplateId
  name: string
  tagline: string
  blurb: string
  swatches: string[]
  traits: string[]
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'vintage', name: 'Vintage Postcards', tagline: 'Kraft paper, stamps & tickets',
    blurb: 'Warm ivory and kraft paper, postage stamps, admit-one tickets, taped polaroids and handwritten notes — the original Elsewhere look.',
    swatches: ['#d5bb90', '#efe3c8', '#b4452c', '#1d2766'], traits: ['Stamps & tickets', 'Taped polaroids', 'Handwritten notes'],
  },
  {
    id: 'mono', name: 'Monochrome Editorial', tagline: 'Black, white & hairlines',
    blurb: 'Strictly black and white. Huge condensed headlines, thin rules, indexed lists and large greyscale photographs on a quiet grid.',
    swatches: ['#fafaf7', '#d9d9d4', '#8a8a85', '#111111'], traits: ['Condensed headlines', 'Hairline borders', 'Greyscale photos'],
  },
  {
    id: 'playful', name: 'Playful Memories', tagline: 'Stickers, doodles & colour',
    blurb: 'Bright, bubbly and a little messy: sticker badges, doodled arrows, wobbly shapes and tilted photos with tape.',
    swatches: ['#ffd23f', '#ff6b6b', '#2ec4b6', '#7b5cff'], traits: ['Stickers & doodles', 'Tilted photos', 'Bubbly lettering'],
  },
  {
    id: 'magazine', name: 'Travel Magazine', tagline: 'Premium serif & big pictures',
    blurb: 'A glossy feature spread: full-bleed covers, elegant high-contrast serif type, drop caps, pull quotes and gold detailing.',
    swatches: ['#f6f0e4', '#14171f', '#b08d57', '#6d1f2c'], traits: ['Full-bleed covers', 'Drop caps & pull quotes', 'Gold details'],
  },
  {
    id: 'nature', name: 'Nature & Nostalgia', tagline: 'Pressed flowers & soft greens',
    blurb: 'Muted sage and cream paper, botanical line drawings, pressed-flower accents, arched photo windows and a quiet handwritten voice.',
    swatches: ['#a9b79b', '#5f7458', '#f3eddc', '#e0b9ae'], traits: ['Botanical drawings', 'Pressed flowers', 'Arched photo frames'],
  },
]

export const DEFAULT_TEMPLATE: TemplateId = 'vintage'
export const isTemplateId = (v: unknown): v is TemplateId => TEMPLATES.some((t) => t.id === v)
export const templateInfo = (id: TemplateId): TemplateInfo => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
