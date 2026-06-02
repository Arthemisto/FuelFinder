import { RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  getFuelForecasts,
  getFuelTrends,
  type FuelForecastResponse,
  type FuelTrendPointResponse,
  type FuelTrendResponse,
} from '../api/fuelFinderApi'
import type { FuelType } from '../types/station'

type HistoryRange = '1w' | '1m' | '3m' | '6m' | '1y'

type FuelSummary = {
  fuelType: FuelType
  label: string
  pointCount: number
  color: string
  swatchClassName: string
}

type SelectedFuelStats = {
  minPrice: number
  averagePrice: number
  maxPrice: number
  currentPrice: number
  currency: 'EUR'
  pointCount: number
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

const historyRangeOptions: { value: HistoryRange; label: string; days: number }[] = [
  { value: '1w', label: '1W', days: 7 },
  { value: '1m', label: '1M', days: 30 },
  { value: '3m', label: '3M', days: 90 },
  { value: '6m', label: '6M', days: 180 },
  { value: '1y', label: '1Y', days: 366 },
]

const fuelTypeOrder: FuelType[] = [
  'diesel',
  'diesel_plus',
  'lpg',
  'petrol95',
  'petrol98',
  'electric',
]

const fuelTypeLabels: Record<FuelType, string> = {
  diesel: 'Diesel',
  diesel_plus: 'Diesel+',
  lpg: 'LPG',
  petrol95: 'Petrol 95',
  petrol98: 'Petrol 98',
  electric: 'EV',
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

// function getVisibleChartDateLabels(dates: string[]): string[] {
//   if (dates.length <= 5) {
//     return dates.map((date) => formatShortDate(parseTrendDate(date)))
//   }

//   const labelCount = 5
//   const lastIndex = dates.length - 1

//   return Array.from({ length: labelCount }, (_, index) => {
//     const dateIndex = Math.round((index / (labelCount - 1)) * lastIndex)

//     return formatShortDate(parseTrendDate(dates[dateIndex]))
//   })
// }

function formatChartDateLabel(date: Date, showYear: boolean): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: showYear ? 'numeric' : undefined,
    day: showYear ? undefined : 'numeric',
  }).format(date)
}

function getVisibleChartDateLabels(dates: string[]): string[] {
  if (dates.length === 0) {
    return []
  }

  if (dates.length <= 7) {
    return dates.map((date) => formatShortDate(parseTrendDate(date)))
  }

  const labelCount = dates.length > 90 ? 4 : 5
  const lastIndex = dates.length - 1
  const showYear = dates.length > 90

  return Array.from({ length: labelCount }, (_, index) => {
    const dateIndex = Math.round((index / (labelCount - 1)) * lastIndex)
    const date = parseTrendDate(dates[dateIndex])

    return formatChartDateLabel(date, showYear)
  })
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatNumericDate(date: Date | null): string {
  if (!date) {
    return 'No update date'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

function getRangeStartDate(
  latestDate: Date | null,
  selectedRange: HistoryRange,
): Date | null {
  if (!latestDate) {
    return null
  }

  const range = historyRangeOptions.find(
    (option) => option.value === selectedRange,
  )

  const startDate = new Date(latestDate)
  startDate.setDate(startDate.getDate() - ((range?.days ?? 7) - 1))

  return startDate
}

function filterTrendPointsByRange(
  points: FuelTrendPointResponse[],
  startDate: Date | null,
  latestDate: Date | null,
): FuelTrendPointResponse[] {
  if (!startDate || !latestDate) {
    return points
  }

  return points.filter((point) => {
    const pointDate = parseTrendDate(point.date)

    return pointDate >= startDate && pointDate <= latestDate
  })
}

function getFilteredTrends(
  trends: FuelTrendResponse[],
  selectedRange: HistoryRange,
  selectedFuelType: FuelType | null,
): FuelTrendResponse[] {
  const latestDate = getLatestTrendDate(trends)
  const startDate = getRangeStartDate(latestDate, selectedRange)

  return fuelTypeOrder.map((fuelType) => {
    const trend = trends.find((item) => item.fuel_type === fuelType)
    const points = trend
      ? filterTrendPointsByRange(trend.points, startDate, latestDate)
      : []

    return {
      fuel_type: fuelType,
      label: fuelTypeLabels[fuelType],
      points:
        selectedFuelType === null || selectedFuelType === fuelType
          ? points
          : [],
    }
  })
}

function buildChartSeries(trends: FuelTrendResponse[]): ChartSeries[] {
  return trends
    .filter((trend) => trend.points.length > 0)
    .map((trend) => {
      const fuelType = trend.fuel_type as FuelType

      return {
        fuelType,
        label: fuelTypeLabels[fuelType],
        color: fuelTypeStyles[fuelType].color,
        points: trend.points,
      }
    })
    .sort(
      (firstFuel, secondFuel) =>
        fuelTypeOrder.indexOf(firstFuel.fuelType) -
        fuelTypeOrder.indexOf(secondFuel.fuelType),
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
        label: fuelTypeLabels[fuelType],
        color: fuelTypeStyles[fuelType].color,
        points: forecast.points.map((point) => ({
          date: point.date,
          average_price: point.predicted_price,
        })),
      }
    })
    .sort(
      (firstFuel, secondFuel) =>
        fuelTypeOrder.indexOf(firstFuel.fuelType) -
        fuelTypeOrder.indexOf(secondFuel.fuelType),
    )
}

function buildFuelSummaries(trends: FuelTrendResponse[]): FuelSummary[] {
  return fuelTypeOrder.map((fuelType) => {
    const trend = trends.find((item) => item.fuel_type === fuelType)

    return {
      fuelType,
      label: fuelTypeLabels[fuelType],
      pointCount: trend?.points.length ?? 0,
      color: fuelTypeStyles[fuelType].color,
      swatchClassName: fuelTypeStyles[fuelType].swatchClassName,
    }
  })
}

function getSelectedFuelStats(
  selectedFuelType: FuelType | null,
  trends: FuelTrendResponse[],
): SelectedFuelStats | null {
  if (!selectedFuelType) {
    return null
  }

  const trend = trends.find((item) => item.fuel_type === selectedFuelType)

  if (!trend || trend.points.length === 0) {
    return null
  }

  const prices = trend.points.map((point) => point.average_price)
  const totalPrice = prices.reduce((sum, price) => sum + price, 0)

  return {
    minPrice: Math.min(...prices),
    averagePrice: totalPrice / prices.length,
    maxPrice: Math.max(...prices),
    currentPrice: trend.points[trend.points.length - 1].average_price,
    currency: 'EUR',
    pointCount: trend.points.length,
  }
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
        r="0.75"
        fill={item.color}
      />
    )
  })
}

type FuelLegendProps = {
  items: FuelSummary[]
  selectedFuelType: FuelType | null
  selectedFuelStats: SelectedFuelStats | null
  onSelectFuelType: (fuelType: FuelType) => void
}

function FuelLegend({
  items,
  selectedFuelType,
  selectedFuelStats,
  onSelectFuelType,
}: FuelLegendProps) {
  if (selectedFuelType && !selectedFuelStats) {
    return (
      <div className="fuel-selected-summary">
        <strong>{fuelTypeLabels[selectedFuelType]}</strong>
        <span>No history</span>
      </div>
    )
  }

  if (selectedFuelType && selectedFuelStats) {
    return (
      <div className="fuel-selected-summary">
        <strong>{fuelTypeLabels[selectedFuelType]}</strong>
        <span>Min: {selectedFuelStats.minPrice.toFixed(3)} EUR</span>
        <span>Avg: {selectedFuelStats.averagePrice.toFixed(3)} EUR</span>
        <span>Max: {selectedFuelStats.maxPrice.toFixed(3)} EUR</span>
        <span>Current: {selectedFuelStats.currentPrice.toFixed(3)} EUR</span>
      </div>
    )
  }

  return (
    <ul className="fuel-update-list fuel-update-list-buttons">
      {items.map((fuel) => (
        <li key={fuel.fuelType}>
          <button
            type="button"
            className="fuel-legend-button"
            onClick={() => onSelectFuelType(fuel.fuelType)}
          >
            <span className={`fuel-swatch ${fuel.swatchClassName}`} />
            <strong>{fuel.label}</strong>
          </button>

          <span>{fuel.pointCount > 0 ? `${fuel.pointCount} points` : 'No history'}</span>
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
    const visibleDates = getVisibleChartDateLabels(dates)

  return (
    <div
      className={
        variant === 'forecast'
          ? 'chart-surface chart-surface-forecast'
          : 'chart-surface'
      }
    >
      {series.length === 0 ? (
        <div className="chart-empty-state">No history</div>
      ) : (
        <svg
          className="trend-chart-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {series.map((item, index) => (
            <g key={item.fuelType}>
              <polyline
                points={buildPolylinePoints(
                  item.points,
                  dates,
                  index,
                  series.length,
                )}
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
      )}

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
  const [selectedRange, setSelectedRange] = useState<HistoryRange>('1w')
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType | null>(null)
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

  const filteredTrends = useMemo(
    () => getFilteredTrends(trends, selectedRange, selectedFuelType),
    [trends, selectedRange, selectedFuelType],
  )

  const historyDates = useMemo(
    () => getSortedHistoryDates(filteredTrends),
    [filteredTrends],
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

  const historySeries = useMemo(
    () => buildChartSeries(filteredTrends),
    [filteredTrends],
  )

  const forecastSeries = useMemo(
    () => buildForecastSeries(forecasts),
    [forecasts],
  )

  const fuelSummaries = useMemo(
    () => buildFuelSummaries(filteredTrends),
    [filteredTrends],
  )

  const selectedFuelStats = useMemo(
    () => getSelectedFuelStats(selectedFuelType, filteredTrends),
    [selectedFuelType, filteredTrends],
  )

  const handleResetHistory = () => {
    setSelectedRange('1w')
    setSelectedFuelType(null)
  }

  const handleSelectFuelType = (fuelType: FuelType) => {
    setSelectedFuelType((currentFuelType) =>
      currentFuelType === fuelType ? null : fuelType,
    )
  }

  return (
    <section className="page-content analytics-page">
      <h1 className="sr-only">Fuel price trends</h1>

      {isLoading && <p>Loading analytics data...</p>}

      {errorMessage && <p>{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <div className="analytics-grid">
          <article className="analytics-card">
            <div className="analytics-card-header">
              <h2>History</h2>

              <button
                type="button"
                className="history-reset-button"
                title="Reset history filters"
                aria-label="Reset history filters"
                onClick={handleResetHistory}
              >
                <RotateCcw aria-hidden="true" size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="history-range-buttons" aria-label="History range">
              {historyRangeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    selectedRange === option.value
                      ? 'history-range-button history-range-button-active'
                      : 'history-range-button'
                  }
                  onClick={() => setSelectedRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="analytics-meta-row">
              <p>Latest update: {formatNumericDate(latestTrendDate)}</p>
              <strong>{chartPeriodLabel}</strong>
            </div>

            <ChartSurface dates={historyDates} series={historySeries} />
            

            <FuelLegend
              items={fuelSummaries}
              selectedFuelType={selectedFuelType}
              selectedFuelStats={selectedFuelStats}
              onSelectFuelType={handleSelectFuelType}
            />
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
              Algorithmic forecast for demo purposes only. May vary from actual
              market prices.
            </p>
          </article>
        </div>
      )}
    </section>
  )
}