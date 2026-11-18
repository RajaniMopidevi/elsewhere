// Chooses which hand-drawn illustration to use for a place / dish / stay, purely from keywords.
export type IlloName =
  | 'temple' | 'church' | 'tower' | 'museum' | 'castle' | 'market' | 'mountain' | 'tree' | 'houses' | 'boat'
  | 'bridge' | 'bowl' | 'cup' | 'plate' | 'cake' | 'bed' | 'hotel' | 'camera' | 'plane' | 'train' | 'sun' | 'fish'
  | 'palm' | 'pine' | 'windmill' | 'lantern' | 'dome' | 'lotus'

export function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return Math.abs(h >>> 0)
}

const rules: [RegExp, IlloName][] = [
  [/temple|shrine|pagoda|mosque|monaster|wat |stupa|torii|mandir/i, 'temple'],
  [/church|cathedral|basilica|chapel|abbey|duomo|sagrada/i, 'church'],
  [/tower|spire|eiffel|skytree|minaret|belfry/i, 'tower'],
  [/museum|gallery|palace|opera|theat|library|academy|colosseum|forum|parthenon|ruin|hall/i, 'museum'],
  [/castle|fort|citadel|kasbah|alcazar|wall/i, 'castle'],
  [/market|bazaar|souk|shop|mall|arcade|street food/i, 'market'],
  [/mountain|volcano|peak|hike|trail|gorge|canyon|hill|viewpoint|summit|ridge/i, 'mountain'],
  [/park|garden|forest|grove|bamboo|rice|terrace|nature|reserve|zoo/i, 'tree'],
  [/canal|river|lake|harbou?r|port|beach|bay|island|waterfront|boat|cruise|sea|coast/i, 'boat'],
  [/bridge|viaduct/i, 'bridge'],
  [/street|quarter|old town|district|neighbo|lane|alley|village|square|plaza|town|city/i, 'houses'],
]

export function placeIllo(name: string, kind = '', idx = 0): IlloName {
  const text = `${name} ${kind}`
  for (const [re, n] of rules) if (re.test(text)) return n
  const pool: IlloName[] = ['houses', 'museum', 'temple', 'tower', 'castle', 'church']
  return pool[(hash(name) + idx) % pool.length]
}

export function foodIllo(name: string, category = '', idx = 0): IlloName {
  const t = `${name} ${category}`
  if (/cafe|café|coffee|tea|matcha|espresso|latte|chai|roaster/i.test(t)) return 'cup'
  if (/cake|pastry|bread|bakery|croissant|dessert|sweet|ice cream|gelato|waffle|pie|cookie|chocolate/i.test(t)) return 'cake'
  if (/ramen|noodle|soup|pho|laksa|udon|bowl|curry|rice|congee|stew|dumpling|hotpot|pasta/i.test(t)) return 'bowl'
  if (/fish|seafood|sushi|oyster|crab|prawn|shrimp|sashimi/i.test(t)) return 'fish'
  if (/market|street|stall|tour|class|experience/i.test(t)) return 'market'
  const pool: IlloName[] = ['plate', 'bowl', 'plate', 'cake']
  return pool[(hash(name) + idx) % pool.length]
}

const DESIGN_MOTIFS: IlloName[] = ['temple', 'church', 'tower', 'museum', 'castle', 'market', 'mountain', 'tree', 'houses', 'boat', 'bridge', 'train', 'sun', 'palm', 'pine', 'windmill', 'lantern', 'dome', 'lotus']

/** Motifs Gemini picked for this destination (validated against the illustrations we can draw). */
export function motifsFrom(design?: { motifs?: string[] }): IlloName[] {
  return (design?.motifs ?? []).filter((m): m is IlloName => (DESIGN_MOTIFS as string[]).includes(m))
}

export function heroIllo(destination: string, country = '', design?: { motifs?: string[] }): IlloName {
  const picked = motifsFrom(design)
  if (picked.length) return picked[0]
  const t = `${destination} ${country}`
  if (/japan|kyoto|tokyo|osaka|china|thai|bangkok|bali|indonesia|korea|seoul|vietnam|nepal|bhutan|india|taiwan|singapore|malaysia/i.test(t)) return 'temple'
  if (/paris|london|rome|italy|france|spain|barcelona|florence|venice|portugal|lisbon|vienna|prague|germany|poland/i.test(t)) return 'church'
  if (/amsterdam|netherlands|bruges|belgium|copenhagen|denmark|stockholm|norway|oslo/i.test(t)) return 'houses'
  if (/swiss|alps|iceland|patagonia|peru|new zealand|canada|austria|himalaya/i.test(t)) return 'mountain'
  if (/greece|athens|egypt|cairo|turkey|istanbul|morocco|marrakech/i.test(t)) return 'museum'
  const pool: IlloName[] = ['houses', 'church', 'temple', 'tower']
  return pool[hash(destination) % pool.length]
}
