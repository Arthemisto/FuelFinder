export type FuelTypeResponse = {
  id: number
  code: string
  label: string
  is_active: boolean
}

export type StationFuelPriceResponse = {
  fuel_type_code: string
  fuel_type_label: string
  price: number
  currency: string
  recorded_at: string
}

export type StationResponse = {
  id: number
  name: string
  brand: string
  address: string
  city: string
  latitude: number
  longitude: number
  is_active: boolean
  fuels: StationFuelPriceResponse[]
}

export type StationFiltersResponse = {
  cities: string[]
  brands: string[]
}

export type StatusResponse = {
  backendStatus: string
  databaseStatus: string
  version: string
  environment: string
  lastPriceUpdate: string | null
  lastImportStatus: string | null
}

export type SearchStationFuelResponse = {
  fuel_type_code: string
  fuel_type_label: string
  price: number
  currency: string
  recorded_at: string
}

export type SearchStationResponse = {
  id: number
  name: string
  brand: string
  address: string
  city: string
  latitude: number
  longitude: number
  distance_km: number
  best_value_score: number
  fuel: SearchStationFuelResponse
}

export type SearchResponse = {
  latitude: number
  longitude: number
  radius_km: number
  fuel_type: string
  stations: SearchStationResponse[]
}

export type FuelTrendPointResponse = {
  date: string
  average_price: number
}

export type FuelTrendResponse = {
  fuel_type: string
  label: string
  points: FuelTrendPointResponse[]
}

export type FuelTrendsResponse = {
  trends: FuelTrendResponse[]
}

export type FuelForecastPointResponse = {
  date: string
  predicted_price: number
}

export type FuelForecastResponse = {
  fuel_type: string
  label: string
  points: FuelForecastPointResponse[]
}

export type FuelForecastsResponse = {
  forecasts: FuelForecastResponse[]
}

export type StationSearchParams = {
  city?: string
  brand?: string
  fuel_type?: string
  sort?: 'price_asc' | 'price_desc'
}

export type SearchStationsParams = {
  latitude: number
  longitude: number
  radius_km: number
  fuel_type: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

export function getStatus(): Promise<StatusResponse> {
  return getJson<StatusResponse>('/api/status')
}

export function getFuelTypes(): Promise<FuelTypeResponse[]> {
  return getJson<FuelTypeResponse[]>('/api/fuel-types')
}

export function getStations(
  params: StationSearchParams = {},
): Promise<StationResponse[]> {
  return getJson<StationResponse[]>(`/api/stations${buildQueryString(params)}`)
}

export function searchStations(
  params: SearchStationsParams,
): Promise<SearchResponse> {
  return getJson<SearchResponse>(`/api/search${buildQueryString(params)}`)
}

export function getFuelTrends(): Promise<FuelTrendsResponse> {
  return getJson<FuelTrendsResponse>('/api/analytics/fuel-trends')
}

export function getFuelForecasts(): Promise<FuelForecastsResponse> {
  return getJson<FuelForecastsResponse>('/api/analytics/forecast')
}

export function getStationFilters(): Promise<StationFiltersResponse> {
  return getJson<StationFiltersResponse>('/api/stations/filters')
}