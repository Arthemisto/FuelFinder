import { MapPin, Navigation } from 'lucide-react'

import type { Station } from '../../types/station'

type StationCardProps = {
  station: Station
  rank?: number
  onShowOnMap?: (stationId: number) => void
}

export function StationCard({
  station,
  rank,
  onShowOnMap,
}: StationCardProps) {
  const handleOpenDirections = () => {
    const destination = `${station.latitude},${station.longitude}`
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`

    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <article className="station-card">
      <div className="station-card-header">
        {rank && <span className="station-rank">#{rank}</span>}
        <h3>{station.name}</h3>
      </div>

      <p>
        {station.price.toFixed(3)} {station.currency} - {station.distanceKm} km
      </p>

      <span>
        {station.address}, {station.city}
      </span>

      <span>Updated {station.lastUpdate}</span>

      <div className="station-card-actions">
        <button
          type="button"
          className="primary-action icon-action"
          onClick={() => onShowOnMap?.(station.id)}
        >
          <MapPin aria-hidden="true" size={18} strokeWidth={2.5} />
          <span>Map</span>
        </button>

        <button
          type="button"
          className="secondary-action icon-action"
          onClick={handleOpenDirections}
        >
          <Navigation aria-hidden="true" size={18} strokeWidth={2.5} />
          <span>Directions</span>
        </button>
      </div>
    </article>
  )
}