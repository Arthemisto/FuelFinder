import { Fuel } from 'lucide-react'

export function Header() {
  return (
    <header className="header-card">
      <div className="header-icon">
        <Fuel aria-hidden="true" size={34} strokeWidth={2.4} />
      </div>

      <div>
        <strong>Fuel Finder</strong>
        <p>Find the best fuel prices near you</p>
      </div>
    </header>
  )
}