import { useMemo, useState } from 'react'

import { StationTable } from '../components/shared/StationTable'
import { stations } from '../data/stations'
import type { FuelType } from '../types/station'

type StationsPageProps = {
  onShowOnMap: (stationId: number) => void
}

const fuelTypeOptions: { value: FuelType | 'all'; label: string }[] = [
  { value: 'all', label: 'All fuel types' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol95', label: 'Petrol 95' },
  { value: 'petrol98', label: 'Petrol 98' },
  { value: 'lpg', label: 'LPG' },
  { value: 'diesel plus', label: 'Diesel Plus' },
  { value: 'electric', label: 'Electric' },
]

const brands = Array.from(new Set(stations.map((station) => station.brand))).sort()

export function StationsPage({ onShowOnMap }: StationsPageProps) {
  const [query, setQuery] = useState('')
  const [fuelType, setFuelType] = useState<FuelType | 'all'>('all')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const filteredStations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return stations.filter((station) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        station.name.toLowerCase().includes(normalizedQuery) ||
        station.city.toLowerCase().includes(normalizedQuery) ||
        station.address.toLowerCase().includes(normalizedQuery)

      const matchesFuelType =
        fuelType === 'all' || station.fuelType === fuelType

      const matchesBrand =
        selectedBrand === null || station.brand === selectedBrand

      return matchesQuery && matchesFuelType && matchesBrand
    })
  }, [fuelType, query, selectedBrand])

  return (
    <section className="page-content stations-page">
      <h1>All stations</h1>

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

      {filteredStations.length > 0 ? (
        <StationTable stations={filteredStations} onShowOnMap={onShowOnMap} />
      ) : (
        <p>No stations match the selected filters.</p>
      )}
    </section>
  )
}