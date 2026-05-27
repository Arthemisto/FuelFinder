# FuelFinder Page Flow

## Purpose
This document describes how the five main frontend pages should work together.

Current stage:
- frontend only;
- mock data only;
- no backend connection yet;
- database indicator is a visual placeholder.

Future stage:
- SearchPage will call backend API;
- backend will read SQLite data;
- ResultsPage, MapPage, and StationsPage will use API data.

## Main User Flow

```text
SearchPage
  -> user enters search values
  -> user clicks Find stations
  -> app stores search request
  -> app opens ResultsPage

ResultsPage
  -> shows cheapest station
  -> shows nearest station
  -> shows best-value station
  -> user can open MapPage

MapPage
  -> shows search result stations on a map
  -> user can inspect station locations

StationsPage
  -> shows all known stations in a table

AnalyticsPage
  -> shows fuel price history and forecast mock charts
```

## App State Plan

At the moment, `App.tsx` only stores:

```text
activePage
```

Later, it should also store:

```text
searchRequest
searchResult
selectedStationId
```

Planned state:

```ts
activePage: PageName
searchRequest: SearchRequest | null
searchResult: SearchResult | null
selectedStationId: number | null
```

## Frontend First Data Flow

During the frontend-only phase:

```text
mock stations
  -> local search function
  -> search result object
  -> ResultsPage / MapPage / StationsPage
```

Later backend phase:

```text
SearchPage form
  -> /api/search request
  -> FastAPI backend
  -> SQLite database
  -> /api/search response
  -> ResultsPage / MapPage
```

## Page 1: SearchPage

Purpose:
- collect user search input.

Content:
- small section label: `FORM WIZARD`;
- page title: `Build a fast station search`;
- latitude input;
- longitude input;
- radius select;
- fuel type select;
- sort preference select;
- `Find stations` button;
- `Use current location` placeholder button.

Initial behavior:
- fields can be static or locally controlled;
- `Find stations` will later update app state and open ResultsPage.

Future behavior:
- validate user input;
- send search request to backend;
- show errors if backend request fails.

## Page 2: ResultsPage

Purpose:
- compare the best station options.

Content:
- small section label: `COMPARISON RESULTS`;
- page title: `Nearest, cheapest, and best-value stations`;
- 3 result cards:
  - Cheapest;
  - Nearest;
  - Best value;
- search values summary;
- small chart or chart placeholder.

Each station card should show:
- station name;
- price;
- distance;
- `Map` button;
- `Nav` placeholder button.

Initial behavior:
- use mock data;
- show fixed result cards.

Future behavior:
- calculate results from search request;
- use backend response;
- map buttons can select a station and open MapPage.

## Page 3: MapPage

Purpose:
- show station locations visually.

Content:
- small section label: `STATION MAP`;
- page title: `Interactive station map`;
- station count;
- map area;
- link or button to open station list;
- map/source note.

Initial behavior:
- use map placeholder or simple CSS mock map.

Future behavior:
- use Leaflet with OpenStreetMap tiles;
- show markers from search results;
- highlight selected station.

## Page 4: AnalyticsPage

Purpose:
- show price trends and forecast.

Content:
- small section label: `ANALYTICS WORKSPACE`;
- page title: `Analytics workspace`;
- history chart panel;
- forecast chart panel;
- legend for fuel types.

Initial behavior:
- use static mock charts or simple CSS/SVG charts.

Future behavior:
- use price history from backend;
- show real calculated trend data;
- show simple forecast based on history.

## Page 5: StationsPage

Purpose:
- show all known fuel stations.

Content:
- station table;
- station name;
- address;
- map action;
- price;
- last update.

Initial behavior:
- show mock station rows.

Future behavior:
- fetch all stations from backend;
- add filtering by fuel type or city;
- map action can open MapPage with selected station.

## Shared Types To Add Later

Planned type files:

```text
src/types/station.ts
src/types/search.ts
```

Planned data file:

```text
src/data/stations.ts
```

## Station Type Draft

```ts
export type FuelType = 'diesel' | 'petrol95' | 'petrol98' | 'lpg'

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
```

## Search Types Draft

```ts
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
```

## Development Order

1. Finish visual shell.
2. Build SearchPage form.
3. Add station/search types.
4. Add mock station data.
5. Build ResultsPage with mock result cards.
6. Build StationsPage table.
7. Build MapPage placeholder.
8. Build AnalyticsPage mock charts.
9. Add local search logic.
10. Replace mock logic with backend API later.

## Notes

The small labels above page titles are called `eyebrow` labels in UI terminology.
They are optional, but they match the provided UI concepts:

```text
FORM WIZARD
COMPARISON RESULTS
STATION MAP
ANALYTICS WORKSPACE
```

If they feel too decorative later, they can be renamed or removed.
