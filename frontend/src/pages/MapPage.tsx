import { divIcon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

import { stations } from '../data/stations'
import type { SearchRequest } from '../types/search'
import type { FuelType } from '../types/station'

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
  'diesel plus': 'Diesel Plus',
  electric: 'Electric',
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

export function MapPage({
  selectedStationId,
  searchRequest,
  onOpenList,
}: MapPageProps) {
  const selectedStation = selectedStationId
    ? stations.find((station) => station.id === selectedStationId)
    : null

  const searchStations = searchRequest
    ? stations.filter((station) => station.fuelType === searchRequest.fuelType)
    : stations

  const visibleStations =
    selectedStation &&
    !searchStations.some((station) => station.id === selectedStation.id)
      ? [...searchStations, selectedStation]
      : searchStations

  const topSearchStationIds = new Set(
    searchRequest
      ? visibleStations.slice(0, 3).map((station) => station.id)
      : [],
  )

  return (
    <section className="page-content map-page">
      <div className="map-page-header">
        <div>
          <h1>Station map</h1>
          <p>{visibleStations.length} stations shown on map.</p>
        </div>

        <button type="button" className="secondary-action" onClick={onOpenList}>
          Open list view
        </button>
      </div>

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
                  {searchRequest && (
                    <>
                      Price: {station.price.toFixed(3)} {station.currency}
                      <br />
                    </>
                  )}
                  {station.address}, {station.city}
                  {searchRequest && (
                    <>
                      <br />
                      Updated: {station.lastUpdate}
                    </>
                  )}
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      <p className="map-note">
        Map tiles are loaded from OpenStreetMap with normal browser caching. The
        app uses mock station data until backend integration is added.
      </p>
    </section>
  )
}