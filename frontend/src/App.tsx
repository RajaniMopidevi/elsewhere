import { useEffect } from 'react'
import { StoreProvider } from './store'
import { LibraryProvider } from './lib/library'
import { navigate, usePath } from './lib/router'
import { RoughDefs } from './components/scrap/Illustrations'
import Landing from './routes/Landing'
import Create from './routes/Create'
import BookView from './routes/BookView'
import Memories from './routes/Memories'
import Collection from './routes/Collection'

function Routes() {
  const path = usePath().replace(/\/+$/, '') || '/'
  const book = path.match(/^\/book\/([^/]+)$/)

  // Old bookmark: /journal used to be the single in-memory journal. Everything is saved now, so send people to their shelf.
  useEffect(() => { if (path === '/journal') navigate('/collection', { replace: true }) }, [path])

  if (book) return <BookView id={decodeURIComponent(book[1])} />
  switch (path) {
    case '/':
      return <Landing />
    case '/create':
      return <Create />
    case '/memories':
      return <Memories />
    case '/collection':
      return <Collection />
    case '/sample':
      return <BookView sample />
    default:
      return <Landing />
  }
}

export default function App() {
  return (
    <StoreProvider>
      <LibraryProvider>
        <RoughDefs />
        <Routes />
      </LibraryProvider>
    </StoreProvider>
  )
}
