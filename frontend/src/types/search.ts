import type { FuelType, Station } from './station'

export type SortPreference = 'bestValue' | 'cheapest' | 'nearest'

export type SearchRequest = {
  latitude: number
  longitude: number
  radiusKm: number
  fuelType: FuelType
  sortPreference: SortPreference
}

export type SearchResult = {
  stations: Station[]
  cheapestStation: Station | null
  nearestStation: Station | null
  bestValueStation: Station | null
}