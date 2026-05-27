import type { Station } from '../../types/station'

type StationCardProps = {
  station: Station
  rank?: number
}

export function StationCard({ station, rank }: StationCardProps) {
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

      <div className="station-card-actions">
        <button type="button" className="primary-action">
          Map
        </button>

        <button type="button" className="secondary-action">
          Nav
        </button>
      </div>
    </article>
  )
}