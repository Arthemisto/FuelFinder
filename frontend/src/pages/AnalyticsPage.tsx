import { stations } from '../data/stations'
import type { FuelType } from '../types/station'

type FuelSummary = {
  fuelType: FuelType
  label: string
  lastUpdate: string
  lineClassName: string
  swatchClassName: string
}

const fuelTypeLabels: Record<FuelType, string> = {
  diesel: 'Diesel',
  petrol95: 'Petrol 95',
  petrol98: 'Petrol 98',
  lpg: 'LPG',
  'diesel plus': 'Diesel Plus',
  electric: 'Electric',
}

const fuelTypeClasses: Record<
  FuelType,
  { lineClassName: string; swatchClassName: string }
> = {
  diesel: {
    lineClassName: 'chart-line-red',
    swatchClassName: 'fuel-swatch-red',
  },
  petrol95: {
    lineClassName: 'chart-line-blue',
    swatchClassName: 'fuel-swatch-blue',
  },
  petrol98: {
    lineClassName: 'chart-line-green',
    swatchClassName: 'fuel-swatch-green',
  },
  lpg: {
    lineClassName: 'chart-line-orange',
    swatchClassName: 'fuel-swatch-orange',
  },
  'diesel plus': {
    lineClassName: 'chart-line-brown',
    swatchClassName: 'fuel-swatch-brown',
  },
  electric: {
    lineClassName: 'chart-line-purple',
    swatchClassName: 'fuel-swatch-purple',
  },
}

const historyChartDates = ['May 25', 'May 26', 'May 27', 'May 28']
const forecastChartDates = ['May 29', 'May 30', 'May 31']
const chartMonthLabel = 'May 2025'

const fuelSummaryMap = stations.reduce<Partial<Record<FuelType, FuelSummary>>>(
  (summaries, station) => {
    const currentSummary = summaries[station.fuelType]
    const stationUpdateTime = Date.parse(station.lastUpdate)
    const currentUpdateTime = currentSummary
      ? Date.parse(currentSummary.lastUpdate)
      : 0

    if (!currentSummary || stationUpdateTime > currentUpdateTime) {
      summaries[station.fuelType] = {
        fuelType: station.fuelType,
        label: fuelTypeLabels[station.fuelType],
        lastUpdate: station.lastUpdate,
        lineClassName: fuelTypeClasses[station.fuelType].lineClassName,
        swatchClassName: fuelTypeClasses[station.fuelType].swatchClassName,
      }
    }

    return summaries
  },
  {},
)

const fuelSummaries = Object.values(fuelSummaryMap).filter(
  (summary): summary is FuelSummary => Boolean(summary),
)

const visibleFuelSummaries = fuelSummaries.slice(0, 4)

type FuelLegendProps = {
  items: FuelSummary[]
}

function FuelLegend({ items }: FuelLegendProps) {
  return (
    <ul className="fuel-update-list">
      {items.map((fuel) => (
        <li key={fuel.fuelType}>
          <span className={`fuel-swatch ${fuel.swatchClassName}`} />
          <strong>{fuel.label}</strong>
          <span>{fuel.lastUpdate}</span>
        </li>
      ))}
    </ul>
  )
}

type ChartSurfaceProps = {
  variant?: 'history' | 'forecast'
}

function ChartSurface({ variant = 'history' }: ChartSurfaceProps) {
  const dates = variant === 'forecast' ? forecastChartDates : historyChartDates

  return (
    <div
      className={
        variant === 'forecast'
          ? 'chart-surface chart-surface-forecast'
          : 'chart-surface'
      }
    >
      <div
        className={
          variant === 'forecast'
            ? 'chart-date-grid chart-date-grid-forecast'
            : 'chart-date-grid'
        }
        aria-hidden="true"
      >
        {dates.map((date) => (
          <span key={date}>{date}</span>
        ))}
      </div>

      {visibleFuelSummaries.map((fuel) => (
        <span key={fuel.fuelType} className={`chart-line ${fuel.lineClassName}`} />
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  return (
    <section className="page-content analytics-page">
      <h1>Fuel price trends</h1>
      <p>
        Track recent price changes and compare fuel types across the station
        network.
      </p>

      <div className="analytics-grid">
        <article className="analytics-card">
          <h2>History</h2>

          <div className="analytics-meta-row">
            <p>Latest fuel updates from:</p>
            <strong>{chartMonthLabel}</strong>
          </div>

          <ChartSurface />

          <FuelLegend items={visibleFuelSummaries} />
        </article>

        <article className="analytics-card">
          <h2>Forecast</h2>

          <div className="analytics-meta-row">
            <p>Forecast based on algorithmic modeling.</p>
            <strong>{chartMonthLabel}</strong>
          </div>

          <ChartSurface variant="forecast" />

          <p className="forecast-note">
            This forecast is an estimate based on mock data and may not match
            real fuel prices.
          </p>
        </article>
      </div>
    </section>
  )
}