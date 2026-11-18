import type { MemoryData } from '../lib/books'

/** Sample used ONLY for the template previews in the style picker. Photo slots show "your photo" placeholders — no fake photographs. */
export const SAMPLE_MEMORY: MemoryData = {
  aiWritten: true,
  photos: [],
  layouts: {},
  input: {
    destination: 'Lisbon', dates: 'June 2025', days: 3, companions: ['Asha', 'Ravi'],
    places: [{ name: 'Alfama', day: 1, note: 'Got lost in the lanes and found a tiny fado bar.' }, { name: 'Belém', day: 2, note: 'Tower at golden hour.' }, { name: 'LX Factory', day: 2 }],
    activities: [{ text: 'Rode tram 28 end to end', day: 1 }], food: [{ name: 'Pastéis de Belém', note: 'Still warm, too much cinnamon.' }, { name: 'A Cevicheria' }],
    moments: ['Sunset at the miradouro with a bottle of vinho verde'], experiences: ['The fado night in Alfama'], notes: '',
  },
  text: {
    title: 'Lisbon, Slowly', subtitle: 'Three days, two friends, one very tired pair of shoes', intro: 'We spent three June days in Lisbon with Asha and Ravi, wandering Alfama, Belém and LX Factory at our own pace.',
    why_memorable: 'The sunset at the miradouro and the fado night are the ones we keep replaying.',
    places: [{ name: 'Alfama', caption: 'We got lost in the lanes and found a tiny fado bar.', annotation: 'found fado!' }, { name: 'Belém', caption: 'The tower at golden hour.', annotation: '' }, { name: 'LX Factory', caption: '', annotation: '' }],
    food: [{ name: 'Pastéis de Belém', caption: 'Still warm, with too much cinnamon.' }, { name: 'A Cevicheria', caption: '' }],
    days: [{ day: 1, title: 'Lanes & trams', summary: 'Alfama on foot, then tram 28 end to end.' }, { day: 2, title: 'Belém and beyond', summary: 'The tower at golden hour, then LX Factory.' }],
    highlights: ['Sunset at the miradouro with a bottle of vinho verde', 'The fado night in Alfama'], closing_note: 'Thank you, Lisbon — for the lanes, the tarts and the long evenings with Asha and Ravi.', annotations: ['found fado!', 'tarts, again'],
    photo_plan: { cover: [], journey: [], food: [], keep: [], places: {}, days: {} },
  },
}
