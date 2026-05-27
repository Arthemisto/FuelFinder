import { useState } from 'react'

import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { MapPage } from './pages/MapPage'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'
import { StationsPage } from './pages/StationsPage'
import type { PageName } from './types/page'

function App() {
  const [activePage, setActivePage] = useState<PageName>('search')

  const handleSearch = () => {
    setActivePage('results')
  }

  const renderPage = () => {
    if (activePage === 'search') {
      return <SearchPage onSearch={handleSearch} />
    }

    if (activePage === 'results') {
      return <ResultsPage />
    }

    if (activePage === 'map') {
      return <MapPage />
    }

    if (activePage === 'analytics') {
      return <AnalyticsPage />
    }

    return <StationsPage />
  }

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </AppLayout>
  )
}

export default App