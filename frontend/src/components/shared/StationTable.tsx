import type { Station } from '../../types/station'

type StationTableProps = {
  stations: Station[]
}

export function StationTable({ stations }: StationTableProps) {
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
              {station.address}, {station.city}
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