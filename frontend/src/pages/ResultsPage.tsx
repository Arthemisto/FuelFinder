import { useState } from 'react'

import { StationCard } from '../components/shared/StationCard'
import { stations } from '../data/stations'
import type { SearchRequest } from '../types/search'
import type { Station } from '../types/station'

type ResultsPageProps = {
  searchRequest: SearchRequest | null
  onShowOnMap: (stationId: number) => void
}

type ResultMode = 'cheapest' | 'nearest' | 'bestValue'

const resultModes: { mode: ResultMode; label: string }[] = [
  { mode: 'cheapest', label: 'Cheapest' },
  { mode: 'nearest', label: 'Nearest' },
  { mode: 'bestValue', label: 'Best value' },
]

function getBestValueScore(station: Station) {
  return station.price + station.distanceKm * 0.01
}

function getTopStations(filteredStations: Station[], mode: ResultMode) {
  const sortedStations = [...filteredStations].sort(
    (firstStation, secondStation) => {
      if (mode === 'cheapest') {
        return firstStation.price - secondStation.price
      }

      if (mode === 'nearest') {
        return firstStation.distanceKm - secondStation.distanceKm
      }

      return getBestValueScore(firstStation) - getBestValueScore(secondStation)
    },
  )

  return sortedStations.slice(0, 3)
}

export function ResultsPage({
  searchRequest,
  onShowOnMap,
}: ResultsPageProps) {
  const [activeMode, setActiveMode] = useState<ResultMode>('cheapest')

  const filteredStations = searchRequest
    ? stations.filter((station) => station.fuelType === searchRequest.fuelType)
    : stations

  const activeStations = getTopStations(filteredStations, activeMode)

  return (
    <section className="page-content results-page">
      <h1>Compare station results</h1>

      {searchRequest && (
        <div className="search-summary">
          <span>{searchRequest.location}</span>
          <span>{searchRequest.radiusKm} km radius</span>
          <span>{searchRequest.fuelType}</span>
        </div>
      )}

      <div className="result-mode-buttons">
        {resultModes.map((item) => (
          <button
            key={item.mode}
            type="button"
            className={
              activeMode === item.mode
                ? 'result-mode-button result-mode-button-active'
                : 'result-mode-button'
            }
            onClick={() => setActiveMode(item.mode)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeStations.length > 0 ? (
        <div className="results-list">
          {activeStations.map((station, index) => (
            <StationCard
              key={station.id}
              station={station}
              rank={index + 1}
              onShowOnMap={onShowOnMap}
            />
          ))}
        </div>
      ) : (
        <p>No stations found for this fuel type in the mock dataset.</p>
      )}
    </section>
  )
}