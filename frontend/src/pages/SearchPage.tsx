import { useEffect, useState } from 'react'

import { getFuelTypes } from '../api/fuelFinderApi'
import type { SearchRequest } from '../types/search'
import type { FuelType } from '../types/station'

type SearchPageProps = {
  onSearch: (request: SearchRequest) => void
}

const defaultLocationLabel = 'Riga, Latvia'
const defaultLocationStatus = 'Default search center: Riga, Latvia.'
const defaultCoordinates = {
  latitude: 56.9496,
  longitude: 24.1052,
}

const fallbackFuelTypeOptions: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol95', label: 'Petrol 95' },
  { value: 'petrol98', label: 'Petrol 98' },
  { value: 'lpg', label: 'LPG' },
  { value: 'diesel_plus', label: 'Diesel Plus' },
  { value: 'electric', label: 'Electric' },
]

export function SearchPage({ onSearch }: SearchPageProps) {
  const [location, setLocation] = useState(defaultLocationLabel)
  const [radiusKm, setRadiusKm] = useState(5)
  const [fuelType, setFuelType] = useState<FuelType>('diesel')
  const [fuelTypeOptions, setFuelTypeOptions] = useState(
    fallbackFuelTypeOptions,
  )
  const [coordinates, setCoordinates] = useState(defaultCoordinates)
  const [locationStatus, setLocationStatus] = useState(defaultLocationStatus)

  useEffect(() => {
    const loadFuelTypes = async () => {
      try {
        const apiFuelTypes = await getFuelTypes()

        setFuelTypeOptions(
          apiFuelTypes.map((apiFuelType) => ({
            value: apiFuelType.code as FuelType,
            label: apiFuelType.label,
          })),
        )
      } catch {
        setFuelTypeOptions(fallbackFuelTypeOptions)
      }
    }

    void loadFuelTypes()
  }, [])

  const handleSearch = () => {
    onSearch({
      location,
      radiusKm,
      fuelType,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCoordinates(defaultCoordinates)
      setLocation(defaultLocationLabel)
      setLocationStatus(
        'Geolocation is not supported. Default Riga center selected.',
      )
      return
    }

    setLocationStatus('Requesting current location...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(5))
        const longitude = Number(position.coords.longitude.toFixed(5))

        setCoordinates({ latitude, longitude })
        setLocation(`Current location: ${latitude}, ${longitude}`)
        setLocationStatus('Current location selected.')
      },
      () => {
        setCoordinates(defaultCoordinates)
        setLocation(defaultLocationLabel)
        setLocationStatus(
          'Location permission was denied. Default Riga center selected.',
        )
      },
    )
  }

  return (
    <section className="page-content search-page">
      <h1 className="sr-only">Find nearby fuel stations</h1>

      <form className="search-form">
        <label className="search-form-wide">
          Location
          <input type="text" value={location} readOnly />
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

        <p className="location-status">{locationStatus}</p>

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