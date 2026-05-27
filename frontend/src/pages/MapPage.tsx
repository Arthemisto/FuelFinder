import { stations } from '../data/stations'

type MapPageProps = {
  selectedStationId: number | null
  onOpenList: () => void
}

const visibleStations = stations.slice(0, 9)
const highlightedStationIds = new Set(
  visibleStations.slice(0, 3).map((station) => station.id),
)

export function MapPage({ selectedStationId, onOpenList }: MapPageProps) {
  return (
    <section className="page-content map-page">
      <div className="map-page-header">
        <div>
          <h1>Station map</h1>
          <p>{visibleStations.length} stations shown on map preview.</p>
        </div>

        <button type="button" className="secondary-action" onClick={onOpenList}>
          Open list view
        </button>
      </div>

      <div className="map-surface" aria-label="Fuel station map preview">
        {visibleStations.map((station, index) => {
          const isHighlighted = selectedStationId
            ? selectedStationId === station.id
            : highlightedStationIds.has(station.id)

          return (
            <button
              key={station.id}
              type="button"
              className={
                isHighlighted
                  ? 'map-marker map-marker-highlighted'
                  : 'map-marker'
              }
              style={{
                left: `${18 + ((index * 17) % 68)}%`,
                top: `${24 + ((index * 23) % 54)}%`,
              }}
              title={`${station.name} - ${station.price.toFixed(3)} ${station.currency}`}
            >
              <span>{index + 1}</span>
            </button>
          )
        })}
      </div>

      <p className="map-note">
        Map tiles will use OpenStreetMap later. This preview shows mock station
        positions while the frontend structure is being built.
      </p>
    </section>
  )
}