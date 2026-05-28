import { useEffect, useMemo, useState } from 'react'

import { getStations, type StationResponse } from '../api/fuelFinderApi'
import type { FuelType } from '../types/station'

type FuelSummary = {
  fuelType: FuelType
  label: string
  averagePrice: number
  cheapestPrice: number
  stationCount: number
  lastUpdate: string
  lineClassName: string
  swatchClassName: string
}

const fuelTypeLabels: Record<FuelType, string> = {
  diesel: 'Diesel',
  petrol95: 'Petrol 95',
  petrol98: 'Petrol 98',
  lpg: 'LPG',
  diesel_plus: 'Diesel Plus',
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
  diesel_plus: {
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
const chartMonthLabel = 'Live API data'

function buildFuelSummaries(stations: StationResponse[]): FuelSummary[] {
  const priceMap = new Map<FuelType, number[]>()

  stations.forEach((station) => {
    station.fuels.forEach((fuel) => {
      const fuelType = fuel.fuel_type_code as FuelType
      const prices = priceMap.get(fuelType) ?? []

      priceMap.set(fuelType, [...prices, fuel.price])
    })
  })

  return Array.from(priceMap.entries())
    .map(([fuelType, prices]) => {
      const totalPrice = prices.reduce((sum, price) => sum + price, 0)
      const averagePrice = totalPrice / prices.length

      return {
        fuelType,
        label: fuelTypeLabels[fuelType],
        averagePrice,
        cheapestPrice: Math.min(...prices),
        stationCount: prices.length,
        lastUpdate: 'Not available',
        lineClassName: fuelTypeClasses[fuelType].lineClassName,
        swatchClassName: fuelTypeClasses[fuelType].swatchClassName,
      }
    })
    .sort((firstFuel, secondFuel) =>
      firstFuel.label.localeCompare(secondFuel.label),
    )
}

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
          <span>
            avg {fuel.averagePrice.toFixed(3)} EUR · min{' '}
            {fuel.cheapestPrice.toFixed(3)} EUR · {fuel.stationCount} stations
          </span>
        </li>
      ))}
    </ul>
  )
}

type ChartSurfaceProps = {
  items: FuelSummary[]
  variant?: 'history' | 'forecast'
}

function ChartSurface({ items, variant = 'history' }: ChartSurfaceProps) {
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

      {items.map((fuel) => (
        <span key={fuel.fuelType} className={`chart-line ${fuel.lineClassName}`} />
      ))}
    </div>
  )
}

export function AnalyticsPage() {
  const [stations, setStations] = useState<StationResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const apiStations = await getStations()
        setStations(apiStations)
      } catch {
        setErrorMessage('Could not load analytics data from the API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadStations()
  }, [])

  const fuelSummaries = useMemo(() => buildFuelSummaries(stations), [stations])
  const visibleFuelSummaries = fuelSummaries.slice(0, 4)

  return (
    <section className="page-content analytics-page">
      <h1>Fuel price trends</h1>
      <p>
        Track recent price changes and compare fuel types across the station
        network.
      </p>

      {isLoading && <p>Loading analytics data...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <div className="analytics-grid">
          <article className="analytics-card">
            <h2>History</h2>

            <div className="analytics-meta-row">
              <p>Latest fuel updates from:</p>
              <strong>{chartMonthLabel}</strong>
            </div>

            <ChartSurface items={visibleFuelSummaries} />

            <FuelLegend items={visibleFuelSummaries} />
          </article>

          <article className="analytics-card">
            <h2>Forecast</h2>

            <div className="analytics-meta-row">
              <p>Forecast based on current backend station prices.</p>
              <strong>{chartMonthLabel}</strong>
            </div>

            <ChartSurface items={visibleFuelSummaries} variant="forecast" />

            <p className="forecast-note">
              This forecast is a placeholder until historical import data is
              available.
            </p>
          </article>
        </div>
      )}
    </section>
  )
}