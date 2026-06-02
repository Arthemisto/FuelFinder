import { useEffect, useMemo, useState } from 'react'

import {
  getStationFilters,
  getStations,
  type StationResponse,
} from '../api/fuelFinderApi'
import { StationTable } from '../components/shared/StationTable'
import type { FuelType, Station } from '../types/station'

type StationsPageProps = {
  onShowOnMap: (stationId: number) => void
}

const fuelTypeOptions: { value: FuelType | 'all'; label: string }[] = [
  { value: 'all', label: 'All fuel types' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol95', label: 'Petrol 95' },
  { value: 'petrol98', label: 'Petrol 98' },
  { value: 'lpg', label: 'LPG' },
  { value: 'diesel_plus', label: 'Diesel Plus' },
  { value: 'electric', label: 'Electric' },
]

function formatUpdateDate(recordedAt?: string): string {
  if (!recordedAt) {
    return 'No update date'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(recordedAt))
}

function mapApiStationToStation(
  station: StationResponse,
  fuelType: FuelType | 'all',
): Station {
  const selectedFuel =
    fuelType === 'all'
      ? station.fuels[0]
      : station.fuels.find((fuel) => fuel.fuel_type_code === fuelType)

  return {
    id: station.id,
    name: station.name,
    brand: station.brand,
    address: station.address,
    city: station.city,
    latitude: station.latitude,
    longitude: station.longitude,
    fuelType: fuelType === 'all' ? 'diesel' : fuelType,
    price: selectedFuel?.price ?? 0,
    currency: 'EUR',
    distanceKm: 0,
    lastUpdate: formatUpdateDate(selectedFuel?.recorded_at),
  }
}

export function StationsPage({ onShowOnMap }: StationsPageProps) {
  const [query, setQuery] = useState('')
  const [fuelType, setFuelType] = useState<FuelType | 'all'>('all')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filters = await getStationFilters()
        setBrands(filters.brands)
      } catch {
        setBrands([])
      }
    }

    void loadFilters()
  }, [])

  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const apiStations = await getStations({
          brand: selectedBrand ?? undefined,
          fuel_type: fuelType === 'all' ? undefined : fuelType,
          sort: fuelType === 'all' ? undefined : 'price_asc',
        })

        setStations(
          apiStations.map((station) =>
            mapApiStationToStation(station, fuelType),
          ),
        )
      } catch {
        setErrorMessage('Could not load stations from the API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadStations()
  }, [fuelType, selectedBrand])

  const filteredStations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return stations.filter((station) => {
      return (
        normalizedQuery.length === 0 ||
        station.name.toLowerCase().includes(normalizedQuery) ||
        station.city.toLowerCase().includes(normalizedQuery) ||
        station.address.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [query, stations])

  return (
    <section className="page-content stations-page">
      <h1 className="sr-only">All stations</h1>

      <div className="station-filters">
        <input
          type="search"
          value={query}
          placeholder="Search by name, city, or address"
          aria-label="Search station"
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          value={fuelType}
          aria-label="Fuel type"
          onChange={(event) => setFuelType(event.target.value as FuelType | 'all')}
        >
          {fuelTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="brand-filter-row" aria-label="Filter by brand">
        <button
          type="button"
          className={
            selectedBrand === null
              ? 'brand-filter brand-filter-active'
              : 'brand-filter'
          }
          onClick={() => setSelectedBrand(null)}
        >
          All brands
        </button>

        {brands.map((brand) => (
          <button
            key={brand}
            type="button"
            className={
              selectedBrand === brand
                ? 'brand-filter brand-filter-active'
                : 'brand-filter'
            }
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </div>

      {isLoading && <p>Loading stations...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && filteredStations.length > 0 && (
        <StationTable stations={filteredStations} onShowOnMap={onShowOnMap} />
      )}

      {!isLoading && !errorMessage && filteredStations.length === 0 && (
        <p>No stations match the selected filters.</p>
      )}
    </section>
  )
}