import { StationTable } from '../components/shared/StationTable'
import { stations } from '../data/stations'

export function StationsPage() {
  return (
    <section className="page-content">
      <h1>All stations</h1>
      <p>Browse the full station list with prices, addresses, and latest update times.</p>

      <StationTable stations={stations} />
    </section>
  )
}