export type FuelType = 'diesel' | 'petrol95' | 'petrol98' | 'lpg' | 'diesel plus' | 'electric' 

export type Station = {
  id: number
  name: string
  brand: string
  address: string
  city: string
  latitude: number
  longitude: number
  fuelType: FuelType
  price: number
  currency: 'EUR'
  distanceKm: number
  lastUpdate: string
}