import { StationTable } from '../components/shared/StationTable'
import { stations } from '../data/stations'

type StationsPageProps = {
  onShowOnMap: (stationId: number) => void
}

export function StationsPage({ onShowOnMap }: StationsPageProps) {
  return (
    <section className="page-content">
      <h1>All stations</h1>
      <p>Browse the full station list with prices, addresses, and latest update times.</p>

      <StationTable stations={stations} onShowOnMap={onShowOnMap} />
    </section>
  )
}