import type { FuelType, Station } from './station'

export type SearchRequest = {
  location: string
  radiusKm: number
  fuelType: FuelType
  latitude?: number
  longitude?: number
}

export type SearchResult = {
  stations: Station[]
  cheapestStation: Station | null
  nearestStation: Station | null
  bestValueStation: Station | null
}