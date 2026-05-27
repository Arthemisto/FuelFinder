type SearchPageProps = {
  onSearch: () => void
}

export function SearchPage({ onSearch }: SearchPageProps) {
  const handleUseCurrentLocation = () => {
    // TODO: use browser geolocation API and convert coordinates into search location.
    window.alert('Current location support will be added later.')
  }

  return (
    <section className="page-content search-page">
      <h1>Find nearby fuel stations</h1>
      <p>
        Search by location, fuel type, and distance to compare the best available
        station options.
      </p>

      <form className="search-form">
        <label className="search-form-wide">
          Location
          <input type="text" defaultValue="Riga, Latvia" />
        </label>

        <label>
          Radius
          <select defaultValue="5">
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </label>

        <label>
          Fuel type
          <select defaultValue="diesel">
            <option value="diesel">Diesel</option>
            <option value="petrol95">Petrol 95</option>
            <option value="petrol98">Petrol 98</option>
            <option value="lpg">LPG</option>
            <option value="dieselPlus">Diesel Plus</option>
            <option value="electric">Electric</option>
          </select>
        </label>

        <div className="search-actions">
          <button type="button" className="primary-action" onClick={onSearch}>
            Find stations
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={handleUseCurrentLocation}
          >
            Use current location
          </button>
        </div>
      </form>
    </section>
  )
}