import { useState } from 'react'

import './App.css'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { MapPage } from './pages/MapPage'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'
import { StationsPage } from './pages/StationsPage'

type PageName = 'search' | 'results' | 'map' | 'analytics' | 'stations'

function App() {
  const [activePage, setActivePage] = useState<PageName>('search')

  return (
    <main>
      <nav>
        <button onClick={() => setActivePage('search')}>Search</button>
        <button onClick={() => setActivePage('results')}>Results</button>
        <button onClick={() => setActivePage('map')}>Map</button>
        <button onClick={() => setActivePage('analytics')}>Analytics</button>
        <button onClick={() => setActivePage('stations')}>All Stations</button>
      </nav>

      {activePage === 'search' && <SearchPage />}
      {activePage === 'results' && <ResultsPage />}
      {activePage === 'map' && <MapPage />}
      {activePage === 'analytics' && <AnalyticsPage />}
      {activePage === 'stations' && <StationsPage />}
    </main>
  )
}

export default App