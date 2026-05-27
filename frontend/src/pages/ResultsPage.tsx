import { useState } from 'react'

import { StationCard } from '../components/shared/StationCard'
import { stations } from '../data/stations'

type ResultMode = 'cheapest' | 'nearest' | 'bestValue'

const resultModes: { mode: ResultMode; label: string }[] = [
  { mode: 'cheapest', label: 'Cheapest' },
  { mode: 'nearest', label: 'Nearest' },
  { mode: 'bestValue', label: 'Best value' },
]

const cheapestStations = [...stations]
  .sort((firstStation, secondStation) => firstStation.price - secondStation.price)
  .slice(0, 3)

const nearestStations = [...stations]
  .sort(
    (firstStation, secondStation) =>
      firstStation.distanceKm - secondStation.distanceKm,
  )
  .slice(0, 3)

const bestValueStations = [...stations]
  .sort((firstStation, secondStation) => {
    const firstStationScore = firstStation.price + firstStation.distanceKm * 0.01
    const secondStationScore =
      secondStation.price + secondStation.distanceKm * 0.01

    return firstStationScore - secondStationScore
  })
  .slice(0, 3)

export function ResultsPage() {
  const [activeMode, setActiveMode] = useState<ResultMode>('cheapest')

  const activeStations =
    activeMode === 'cheapest'
      ? cheapestStations
      : activeMode === 'nearest'
        ? nearestStations
        : bestValueStations

  return (
    <section className="page-content results-page">
      <h1>Compare station results</h1>
      <p>
        Choose how to compare stations and review the top matching options for
        the current search.
      </p>

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

      <div className="results-list">
        {activeStations.map((station, index) => (
          <StationCard key={station.id} station={station} rank={index + 1} />
        ))}
      </div>
    </section>
  )
}