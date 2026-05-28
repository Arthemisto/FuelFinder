import { useEffect, useState } from 'react'

import {
  getStations,
  searchStations,
  type SearchStationResponse,
  type StationResponse,
} from '../api/fuelFinderApi'
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

function mapSearchStationToStation(
  station: SearchStationResponse,
  fuelType: FuelType,
): Station {
  return {
    id: station.id,
    name: station.name,
    brand: station.brand,
    address: station.address,
    city: station.city,
    latitude: station.latitude,
    longitude: station.longitude,
    fuelType,
    price: station.fuel.price,
    currency: 'EUR',
    distanceKm: station.distance_km,
    lastUpdate: 'Live API data',
  }
}

function mapApiStationToStation(
  station: StationResponse,
  fuelType: FuelType,
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
    distanceKm: 0,
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
        const hasCoordinates =
          searchRequest?.latitude !== undefined &&
          searchRequest.longitude !== undefined

        if (searchRequest && hasCoordinates) {
          const searchResponse = await searchStations({
            latitude: searchRequest.latitude as number,
            longitude: searchRequest.longitude as number,
            radius_km: searchRequest.radiusKm,
            fuel_type: fuelType,
          })

          setStations(
            searchResponse.stations.map((station) =>
              mapSearchStationToStation(station, fuelType),
            ),
          )

          return
        }

        const apiStations = await getStations({
          fuel_type: fuelType,
          sort: activeMode === 'cheapest' ? 'price_asc' : undefined,
        })

        setStations(
          apiStations.map((station) => mapApiStationToStation(station, fuelType)),
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
  const isRadiusApplied =
    searchRequest?.latitude !== undefined && searchRequest.longitude !== undefined

  return (
    <section className="page-content results-page">
      <h1>Compare station results</h1>

      {searchRequest && (
        <div className="search-summary">
          <span>{searchRequest.location}</span>
          <span>
            {isRadiusApplied
              ? `${searchRequest.radiusKm} km radius`
              : 'Fuel type filter'}
          </span>
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
        <p>No stations found for this fuel type in the selected radius.</p>
      )}
    </section>
  )
}