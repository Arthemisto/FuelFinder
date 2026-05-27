import { useState } from 'react'

import type { SearchRequest } from '../types/search'
import type { FuelType } from '../types/station'

type SearchPageProps = {
  onSearch: (request: SearchRequest) => void
}

const fuelTypeOptions: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol95', label: 'Petrol 95' },
  { value: 'petrol98', label: 'Petrol 98' },
  { value: 'lpg', label: 'LPG' },
  { value: 'diesel plus', label: 'Diesel Plus' },
  { value: 'electric', label: 'Electric' },
]

export function SearchPage({ onSearch }: SearchPageProps) {
  const [location, setLocation] = useState('Riga, Latvia')
  const [radiusKm, setRadiusKm] = useState(5)
  const [fuelType, setFuelType] = useState<FuelType>('diesel')

  const handleSearch = () => {
    onSearch({
      location,
      radiusKm,
      fuelType,
    })
  }

  const handleUseCurrentLocation = () => {
    // TODO: use browser geolocation API and convert coordinates into search location.
    window.alert('Current location support will be added later.')
  }

  return (
    <section className="page-content search-page">
      <h1>Find nearby fuel stations</h1>
      <p>
        Search by location, fuel type, and distance to compare the best available
        station options.
      </p>

      <form className="search-form">
        <label className="search-form-wide">
          Location
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>

        <label>
          Radius
          <select
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
          >
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </label>

        <label>
          Fuel type
          <select
            value={fuelType}
            onChange={(event) => setFuelType(event.target.value as FuelType)}
          >
            {fuelTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="search-actions">
          <button type="button" className="primary-action" onClick={handleSearch}>
            Find stations
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={handleUseCurrentLocation}
          >
            Use current location
          </button>
        </div>
      </form>
    </section>
  )
}