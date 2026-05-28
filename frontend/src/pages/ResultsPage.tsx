import { useEffect, useState } from 'react'

import { getStations, type StationResponse } from '../api/fuelFinderApi'
import { StationCard } from '../components/shared/StationCard'
import type { SearchRequest } from '../types/search'
import type { FuelType, Station } from '../types/station'

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

function calculateDistanceKm(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number,
) {
  const earthRadiusKm = 6371
  const latitudeDistance = ((secondLatitude - firstLatitude) * Math.PI) / 180
  const longitudeDistance = ((secondLongitude - firstLongitude) * Math.PI) / 180

  const startLatitude = (firstLatitude * Math.PI) / 180
  const endLatitude = (secondLatitude * Math.PI) / 180

  const haversine =
    Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDistance / 2) *
      Math.sin(longitudeDistance / 2)

  return Number(
    (earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))).toFixed(2),
  )
}

function getStationDistance(station: StationResponse, searchRequest: SearchRequest | null) {
  if (!searchRequest?.latitude || !searchRequest.longitude) {
    return 0
  }

  return calculateDistanceKm(
    searchRequest.latitude,
    searchRequest.longitude,
    station.latitude,
    station.longitude,
  )
}

function mapApiStationToStation(
  station: StationResponse,
  fuelType: FuelType,
  searchRequest: SearchRequest | null,
): Station {
  const selectedFuel =
    station.fuels.find((fuel) => fuel.fuel_type_code === fuelType) ??
    station.fuels[0]

  return {
    id: station.id,
    name: station.name,
    brand: station.brand,
    address: station.address,
    city: station.city,
    latitude: station.latitude,
    longitude: station.longitude,
    fuelType,
    price: selectedFuel?.price ?? 0,
    currency: 'EUR',
    distanceKm: getStationDistance(station, searchRequest),
    lastUpdate: 'Live API data',
  }
}

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
  const [stations, setStations] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const fuelType = searchRequest?.fuelType ?? 'diesel'
        const apiStations = await getStations({
          fuel_type: fuelType,
          sort: activeMode === 'cheapest' ? 'price_asc' : undefined,
        })

        setStations(
          apiStations.map((station) =>
            mapApiStationToStation(station, fuelType, searchRequest),
          ),
        )
      } catch {
        setErrorMessage('Could not load station results from the API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadStations()
  }, [activeMode, searchRequest])

  const activeStations = getTopStations(stations, activeMode)

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

      {isLoading && <p>Loading station results...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && activeStations.length > 0 && (
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
      )}

      {!isLoading && !errorMessage && activeStations.length === 0 && (
        <p>No stations found for this fuel type.</p>
      )}
    </section>
  )
}