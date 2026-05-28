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

export type StationSearchParams = {
  city?: string
  brand?: string
  fuel_type?: string
  sort?: 'price_asc' | 'price_desc'
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function buildQueryString(params: StationSearchParams): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
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

export function getStationFilters(): Promise<StationFiltersResponse> {
  return getJson<StationFiltersResponse>('/api/stations/filters')
}