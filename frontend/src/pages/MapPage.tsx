import { useEffect, useMemo, useState } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

import {
  getStations,
  searchStations,
  type SearchStationResponse,
  type StationResponse,
} from '../api/fuelFinderApi'
import type { SearchRequest } from '../types/search'
import type { FuelType, Station } from '../types/station'

type MapPageProps = {
  selectedStationId: number | null
  searchRequest: SearchRequest | null
  onOpenList: () => void
}

const center: [number, number] = [56.9496, 24.1052]

const fuelTypeLabels: Record<FuelType, string> = {
  diesel: 'Diesel',
  petrol95: 'Petrol 95',
  petrol98: 'Petrol 98',
  lpg: 'LPG',
  diesel_plus: 'Diesel Plus',
  electric: 'Electric',
}

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

function createStationIcon(isHighlighted: boolean, label: number) {
  return divIcon({
    className: 'leaflet-station-marker-shell',
    html: `<span class="leaflet-station-marker ${
      isHighlighted ? 'leaflet-station-marker-highlighted' : ''
    }">${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function hasSearchCoordinates(searchRequest: SearchRequest | null) {
  return (
    searchRequest?.latitude !== undefined &&
    searchRequest.longitude !== undefined
  )
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
    lastUpdate: formatUpdateDate(selectedFuel?.recorded_at),
  }
}

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
    lastUpdate: formatUpdateDate(station.fuel.recorded_at),
  }
}

export function MapPage({
  selectedStationId,
  searchRequest,
  onOpenList,
}: MapPageProps) {
  const [stations, setStations] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fuelType = searchRequest?.fuelType ?? 'diesel'
  const isRadiusApplied = hasSearchCoordinates(searchRequest)

  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        if (searchRequest && isRadiusApplied) {
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
          fuel_type: searchRequest ? fuelType : undefined,
          sort: searchRequest ? 'price_asc' : undefined,
        })

        setStations(
          apiStations.map((station) => mapApiStationToStation(station, fuelType)),
        )
      } catch {
        setErrorMessage('Could not load map stations from the API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadStations()
  }, [fuelType, isRadiusApplied, searchRequest])

  const selectedStation = useMemo(() => {
    return selectedStationId
      ? stations.find((station) => station.id === selectedStationId)
      : null
  }, [selectedStationId, stations])

  const visibleStations =
    selectedStation &&
    !stations.some((station) => station.id === selectedStation.id)
      ? [...stations, selectedStation]
      : stations

  const topSearchStationIds = new Set(
    searchRequest
      ? visibleStations.slice(0, 3).map((station) => station.id)
      : [],
  )

  return (
    <section className="page-content map-page">
      <div className="map-page-header">
        <div>
          <h1 className="sr-only">Station map</h1>
          <p>
            {visibleStations.length} stations shown on map
            {searchRequest && isRadiusApplied
              ? ` within ${searchRequest.radiusKm} km.`
              : '.'}
          </p>
        </div>

        <p className="map-loading-status">
          {isLoading ? 'Loading map stations...' : ''}
        </p>

        <button type="button" className="secondary-action" onClick={onOpenList}>
          Open list view
        </button>
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <div className="leaflet-map-shell">
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={false}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visibleStations.map((station, index) => {
            const isHighlighted = selectedStationId
              ? selectedStationId === station.id
              : topSearchStationIds.has(station.id)

            return (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={createStationIcon(isHighlighted, index + 1)}
              >
                <Popup>
                  <strong>{station.name}</strong>
                  <br />
                  Fuel: {fuelTypeLabels[station.fuelType]}
                  <br />
                  Price: {station.price.toFixed(3)} {station.currency}
                  <br />
                  {isRadiusApplied && (
                    <>
                      Distance: {station.distanceKm} km
                      <br />
                    </>
                  )}
                  {station.address}, {station.city}
                  <br />
                  Updated: {station.lastUpdate}
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </section>
  )
}