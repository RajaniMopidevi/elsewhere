// Mirrors backend/app/models (Pydantic). Keep in sync.
export interface TripRequest {
  destination: string
  days: number
  start_location?: string
  travel_dates?: string
  travellers?: number
  budget?: string
  interests: string[]
  accommodation?: string
  travel_style?: string
  notes?: string
}

export interface Place { name: string; kind: string; area: string; description: string; note: string; needs_verification: boolean }
export interface FoodItem { name: string; category: string; area: string; description: string; note: string; needs_verification: boolean }
export interface StayArea { name: string; vibe: string; why: string; best_for: string }
export interface Stay { name: string; area: string; style: string; description: string; needs_verification: boolean }
export interface RouteCluster { name: string; places: string[]; note: string }
export interface Route { summary: string; order: string[]; clusters: RouteCluster[] }
export interface Stop { part: string; place: string; activity: string }
export interface Day {
  day: number; title: string; area: string; intro: string
  stops: Stop[]; food_stop?: { name: string; note: string } | null; caption: string
}

export interface Journal {
  title: string; destination: string; country: string; subtitle: string; intro: string; editorial: string
  facts: string[]; places: Place[]; food: FoodItem[]
  stay_areas: StayArea[]; stays: Stay[]; stay_notes: string
  route: Route; days: Day[]
  tips: string[]; customs: string[]; useful_info: string[]; packing: string[]; annotations: string[]
  disclaimer: string
  design?: { region: string; mood: string; motifs: string[] }
}

export interface JournalResponse {
  journal: Journal
  trip: TripRequest
  meta: { model: string; generated_at: string }
}

export interface PhotoInfo { url: string; page_url: string; title: string; credit: string }
export type PhotoMap = Record<string, PhotoInfo | null>
