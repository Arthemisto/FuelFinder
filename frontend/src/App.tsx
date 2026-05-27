import { useState } from 'react'

import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { MapPage } from './pages/MapPage'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'
import { StationsPage } from './pages/StationsPage'
import type { PageName } from './types/page'
import type { SearchRequest } from './types/search'

function App() {
  const [activePage, setActivePage] = useState<PageName>('search')
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null)
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null)

  const handleSearch = (request: SearchRequest) => {
    setSearchRequest(request)
    setSelectedStationId(null)
    setActivePage('results')
  }

  const handleShowStationOnMap = (stationId: number) => {
    setSelectedStationId(stationId)
    setActivePage('map')
  }

  const handlePageChange = (page: PageName) => {
    if (page !== 'map') {
      setSelectedStationId(null)
    }

    setActivePage(page)
  }

  const renderPage = () => {
    if (activePage === 'search') {
      return <SearchPage onSearch={handleSearch} />
    }

    if (activePage === 'results') {
      return (
        <ResultsPage
          searchRequest={searchRequest}
          onShowOnMap={handleShowStationOnMap}
        />
      )
    }

    if (activePage === 'map') {
      return (
        <MapPage
          selectedStationId={selectedStationId}
          onOpenList={() => setActivePage('stations')}
        />
      )
    }

    if (activePage === 'analytics') {
      return <AnalyticsPage />
    }

    return <StationsPage onShowOnMap={handleShowStationOnMap} />
  }

  return (
    <AppLayout activePage={activePage} onPageChange={handlePageChange}>
      {renderPage()}
    </AppLayout>
  )
}

export default App