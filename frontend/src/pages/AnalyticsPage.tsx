import { useEffect, useMemo, useState } from 'react'

import {
  getFuelTrends,
  type FuelTrendResponse,
} from '../api/fuelFinderApi'
import type { FuelType } from '../types/station'

type FuelSummary = {
  fuelType: FuelType
  label: string
  averagePrice: number
  cheapestPrice: number
  pointCount: number
  lineClassName: string
  swatchClassName: string
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

function parseTrendDate(date: string): Date {
  return new Date(`${date}T00:00:00`)
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatMonthYear(date: Date | null): string {
  if (!date) {
    return 'No price history'
  }

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getSortedHistoryDates(trends: FuelTrendResponse[]): string[] {
  return Array.from(
    new Set(
      trends.flatMap((trend) => trend.points.map((point) => point.date)),
    ),
  ).sort()
}

function getLatestTrendDate(trends: FuelTrendResponse[]): Date | null {
  const dates = getSortedHistoryDates(trends)

  if (dates.length === 0) {
    return null
  }

  return parseTrendDate(dates[dates.length - 1])
}

function getHistoryChartDates(trends: FuelTrendResponse[]): string[] {
  return getSortedHistoryDates(trends).slice(-4).map((date) =>
    formatShortDate(parseTrendDate(date)),
  )
}

function getForecastChartDates(latestDate: Date | null): string[] {
  if (!latestDate) {
    return []
  }

  return [1, 2, 3].map((daysAhead) => {
    const forecastDate = new Date(latestDate)
    forecastDate.setDate(forecastDate.getDate() + daysAhead)

    return formatShortDate(forecastDate)
  })
}

function buildFuelSummaries(trends: FuelTrendResponse[]): FuelSummary[] {
  return trends
    .filter((trend) => trend.points.length > 0)
    .map((trend) => {
      const prices = trend.points.map((point) => point.average_price)
      const totalPrice = prices.reduce((sum, price) => sum + price, 0)
      const averagePrice = totalPrice / prices.length
      const fuelType = trend.fuel_type as FuelType

      return {
        fuelType,
        label: trend.label,
        averagePrice,
        cheapestPrice: Math.min(...prices),
        pointCount: trend.points.length,
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
            avg {fuel.averagePrice.toFixed(3)} EUR - min{' '}
            {fuel.cheapestPrice.toFixed(3)} EUR - {fuel.pointCount} points
          </span>
        </li>
      ))}
    </ul>
  )
}

type ChartSurfaceProps = {
  dates: string[]
  items: FuelSummary[]
  variant?: 'history' | 'forecast'
}

function ChartSurface({
  dates,
  items,
  variant = 'history',
}: ChartSurfaceProps) {
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
  const [trends, setTrends] = useState<FuelTrendResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadFuelTrends = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const apiTrends = await getFuelTrends()
        setTrends(apiTrends.trends)
      } catch {
        setErrorMessage('Could not load analytics data from the API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadFuelTrends()
  }, [])

  const latestTrendDate = useMemo(() => getLatestTrendDate(trends), [trends])
  const chartPeriodLabel = useMemo(
    () => formatMonthYear(latestTrendDate),
    [latestTrendDate],
  )
  const fuelSummaries = useMemo(() => buildFuelSummaries(trends), [trends])
  const visibleFuelSummaries = fuelSummaries.slice(0, 4)
  const historyChartDates = useMemo(() => getHistoryChartDates(trends), [trends])
  const forecastChartDates = useMemo(
    () => getForecastChartDates(latestTrendDate),
    [latestTrendDate],
  )

  return (
    <section className="page-content analytics-page">
      <h1>Fuel price trends</h1>

      {isLoading && <p>Loading analytics data...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <div className="analytics-grid">
          <article className="analytics-card">
            <h2>History</h2>

            <div className="analytics-meta-row">
              <p>Latest fuel updates from:</p>
              <strong>{chartPeriodLabel}</strong>
            </div>

            <ChartSurface
              dates={historyChartDates}
              items={visibleFuelSummaries}
            />

            <FuelLegend items={visibleFuelSummaries} />
          </article>

          <article className="analytics-card">
            <h2>Forecast</h2>

            <div className="analytics-meta-row">
              <p>Forecast based on current backend price history.</p>
              <strong>{chartPeriodLabel}</strong>
            </div>

            <ChartSurface
              dates={forecastChartDates}
              items={visibleFuelSummaries}
              variant="forecast"
            />

            <p className="forecast-note">
              This forecast is a placeholder until forecast strategy logic is
              available.
            </p>
          </article>
        </div>
      )}
    </section>
  )
}