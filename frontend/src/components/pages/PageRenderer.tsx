import type { PageSpec } from '../../lib/pages'
import CoverPage from './CoverPage'
import DayPage from './DayPage'
import DestinationPage from './DestinationPage'
import FoodPage from './FoodPage'
import MapPage from './MapPage'
import NotesPage from './NotesPage'
import PlacesPage from './PlacesPage'
import StayPage from './StayPage'

/** Renders one fixed-size (794×1123 px, A4 @ 96dpi) journal page. */
export default function PageRenderer({ spec, n }: { spec: PageSpec; n: number }) {
  switch (spec.kind) {
    case 'cover': return <CoverPage n={n} />
    case 'destination': return <DestinationPage n={n} />
    case 'map': return <MapPage n={n} />
    case 'places': return <PlacesPage n={n} items={spec.items} part={spec.part} parts={spec.parts} />
    case 'food': return <FoodPage n={n} items={spec.items} />
    case 'stay': return <StayPage n={n} />
    case 'day': return <DayPage n={n} day={spec.day} variant={spec.variant} />
    case 'notes': return <NotesPage n={n} />
  }
}
