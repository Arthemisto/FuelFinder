import { useEffect, useMemo, useState } from 'react'

import {
  getFuelForecasts,
  getFuelTrends,
  type FuelForecastResponse,
  type FuelTrendPointResponse,
  type FuelTrendResponse,
} from '../api/fuelFinderApi'
import type { FuelType } from '../types/station'

type FuelSummary = {
  fuelType: FuelType
  label: string
  averagePrice: number
  cheapestPrice: number
  pointCount: number
  color: string
  swatchClassName: string
}

type ChartSeries = {
  fuelType: FuelType
  label: string
  color: string
  points: FuelTrendPointResponse[]
}

type ForecastChartSeries = {
  fuelType: FuelType
  label: string
  color: string
  points: FuelTrendPointResponse[]
}

const fuelTypeStyles: Record<
  FuelType,
  { color: string; swatchClassName: string }
> = {
  diesel: {
    color: '#d9291c',
    swatchClassName: 'fuel-swatch-red',
  },
  petrol95: {
    color: '#1e55c8',
    swatchClassName: 'fuel-swatch-blue',
  },
  petrol98: {
    color: '#1f7a34',
    swatchClassName: 'fuel-swatch-green',
  },
  lpg: {
    color: '#d9822b',
    swatchClassName: 'fuel-swatch-orange',
  },
  diesel_plus: {
    color: '#8a4a16',
    swatchClassName: 'fuel-swatch-brown',
  },
  electric: {
    color: '#7b4bb2',
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

function getForecastDates(latestDate: Date | null): string[] {
  if (!latestDate) {
    return []
  }

  return [1, 2, 3].map((daysAhead) => {
    const forecastDate = new Date(latestDate)
    forecastDate.setDate(forecastDate.getDate() + daysAhead)

    return forecastDate.toISOString().slice(0, 10)
  })
}

function buildChartSeries(trends: FuelTrendResponse[]): ChartSeries[] {
  return trends
    .filter((trend) => trend.points.length > 0)
    .map((trend) => {
      const fuelType = trend.fuel_type as FuelType

      return {
        fuelType,
        label: trend.label,
        color: fuelTypeStyles[fuelType].color,
        points: trend.points,
      }
    })
    .sort((firstFuel, secondFuel) =>
      firstFuel.label.localeCompare(secondFuel.label),
    )
}

function buildForecastSeries(
  forecasts: FuelForecastResponse[],
): ForecastChartSeries[] {
  return forecasts
    .filter((forecast) => forecast.points.length > 0)
    .map((forecast) => {
      const fuelType = forecast.fuel_type as FuelType

      return {
        fuelType,
        label: forecast.label,
        color: fuelTypeStyles[fuelType].color,
        points: forecast.points.map((point) => ({
          date: point.date,
          average_price: point.predicted_price,
        })),
      }
    })
    .sort((firstFuel, secondFuel) =>
      firstFuel.label.localeCompare(secondFuel.label),
    )
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
        color: fuelTypeStyles[fuelType].color,
        swatchClassName: fuelTypeStyles[fuelType].swatchClassName,
      }
    })
    .sort((firstFuel, secondFuel) =>
      firstFuel.label.localeCompare(secondFuel.label),
    )
}

function getChartPointCoordinate(
  point: FuelTrendPointResponse,
  points: FuelTrendPointResponse[],
  dates: string[],
  seriesIndex: number,
  seriesCount: number,
): { x: number; y: number } {
  const width = 100
  const leftPadding = 7
  const rightPadding = 7
  const usableWidth = width - leftPadding - rightPadding

  const laneTop = 18
  const laneBottom = 68
  const laneStep =
    seriesCount <= 1 ? 0 : (laneBottom - laneTop) / (seriesCount - 1)
  const laneCenter = laneTop + laneStep * seriesIndex
  const laneAmplitude = 8

  const prices = points.map((item) => item.average_price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  const dateIndex = dates.indexOf(point.date)
  const x =
    dates.length <= 1
      ? width / 2
      : leftPadding + (dateIndex / (dates.length - 1)) * usableWidth

  const normalizedPrice =
    priceRange === 0 ? 0.5 : (point.average_price - minPrice) / priceRange

  const y = laneCenter + (0.5 - normalizedPrice) * laneAmplitude * 2

  return { x, y }
}


function buildPolylinePoints(
  points: FuelTrendPointResponse[],
  dates: string[],
  seriesIndex: number,
  seriesCount: number,
): string {
  return points
    .map((point) => {
      const { x, y } = getChartPointCoordinate(
        point,
        points,
        dates,
        seriesIndex,
        seriesCount,
      )

      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}
type FuelLegendProps = {
  items: FuelSummary[]
}

function renderChartPointMarkers(
  item: ChartSeries,
  dates: string[],
  seriesIndex: number,
  seriesCount: number,
) {
  return item.points.map((point) => {
    const { x, y } = getChartPointCoordinate(
      point,
      item.points,
      dates,
      seriesIndex,
      seriesCount,
    )

    return (
      <circle
        key={`${item.fuelType}-${point.date}`}
        cx={x}
        cy={y}
        r="1.4"
        fill={item.color}
      />
    )
  })
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
  series: ChartSeries[]
  variant?: 'history' | 'forecast'
}

function ChartSurface({
  dates,
  series,
  variant = 'history',
}: ChartSurfaceProps) {
  const visibleDates = dates.map((date) => formatShortDate(parseTrendDate(date)))

  return (
    <div
      className={
        variant === 'forecast'
          ? 'chart-surface chart-surface-forecast'
          : 'chart-surface'
      }
    >
      <svg
        className="trend-chart-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
{series.map((item, index) => (
  <g key={item.fuelType}>
    <polyline
      points={buildPolylinePoints(item.points, dates, index, series.length)}
      fill="none"
      stroke={item.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      vectorEffect="non-scaling-stroke"
    />

    {renderChartPointMarkers(item, dates, index, series.length)}
  </g>
))}
      </svg>

      <div
        className={
          variant === 'forecast'
            ? 'chart-date-grid chart-date-grid-forecast'
            : 'chart-date-grid'
        }
        aria-hidden="true"
      >
        {visibleDates.map((date) => (
          <span key={date}>{date}</span>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const [trends, setTrends] = useState<FuelTrendResponse[]>([])
  const [forecasts, setForecasts] = useState<FuelForecastResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [apiTrends, apiForecasts] = await Promise.all([
          getFuelTrends(),
          getFuelForecasts(),
        ])

        setTrends(apiTrends.trends)
        setForecasts(apiForecasts.forecasts)
      } catch {
        setErrorMessage('Could not load analytics data from the API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadAnalyticsData()
  }, [])

  const latestTrendDate = useMemo(() => getLatestTrendDate(trends), [trends])

  const chartPeriodLabel = useMemo(
    () => formatMonthYear(latestTrendDate),
    [latestTrendDate],
  )

  const historyDates = useMemo(
    () => getSortedHistoryDates(trends).slice(-4),
    [trends],
  )

  const forecastDates = useMemo(() => {
    const datesFromForecasts = Array.from(
      new Set(
        forecasts.flatMap((forecast) =>
          forecast.points.map((point) => point.date),
        ),
      ),
    ).sort()

    return datesFromForecasts.length > 0
      ? datesFromForecasts
      : getForecastDates(latestTrendDate)
  }, [forecasts, latestTrendDate])

  const historySeries = useMemo(() => buildChartSeries(trends), [trends])

  const forecastSeries = useMemo(
    () => buildForecastSeries(forecasts),
    [forecasts],
  )

  const fuelSummaries = useMemo(() => buildFuelSummaries(trends), [trends])
  const visibleFuelSummaries = fuelSummaries.slice(0, 4)

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

            <ChartSurface dates={historyDates} series={historySeries} />

            <FuelLegend items={visibleFuelSummaries} />
          </article>

          <article className="analytics-card">
            <h2>Forecast</h2>

            <div className="analytics-meta-row">
              <p>Forecast based on backend price history.</p>
              <strong>{chartPeriodLabel}</strong>
            </div>

            <ChartSurface
              dates={forecastDates}
              series={forecastSeries}
              variant="forecast"
            />

            <p className="forecast-note">
              This forecast is loaded from the backend forecast API.
            </p>
          </article>
        </div>
      )}
    </section>
  )
}