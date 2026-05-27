import type { Station } from '../../types/station'

type StationTableProps = {
  stations: Station[]
  onShowOnMap?: (stationId: number) => void
}

export function StationTable({ stations, onShowOnMap }: StationTableProps) {
  return (
    <table className="station-table">
      <thead>
        <tr>
          <th>Station name</th>
          <th>Address</th>
          <th>Price</th>
          <th>Last update</th>
        </tr>
      </thead>

      <tbody>
        {stations.map((station) => (
          <tr key={station.id}>
            <td>
              <strong>{station.name}</strong>
              <span>{station.brand}</span>
            </td>

            <td>
              <div className="station-address-cell">
                <span>
                  {station.address}, {station.city}
                </span>

                {onShowOnMap && (
                  <button
                    type="button"
                    className="table-map-button"
                    onClick={() => onShowOnMap(station.id)}
                  >
                    Map
                  </button>
                )}
              </div>
            </td>

            <td>
              {station.price.toFixed(3)} {station.currency}
            </td>

            <td>{station.lastUpdate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}