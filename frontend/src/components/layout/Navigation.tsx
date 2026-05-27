import {
  Fuel,
  List,
  MapPin,
  Search,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import type { PageName } from '../../types/page'

type NavigationProps = {
  activePage: PageName
  onPageChange: (page: PageName) => void
}

const navigationItems: { page: PageName; label: string; Icon: LucideIcon }[] = [
  { page: 'search', label: 'Search', Icon: Search },
  { page: 'results', label: 'Results', Icon: List },
  { page: 'map', label: 'Map', Icon: MapPin },
  { page: 'analytics', label: 'Analytics', Icon: TrendingUp },
  { page: 'stations', label: 'All Stations', Icon: Fuel },
]

export function Navigation({ activePage, onPageChange }: NavigationProps) {
  return (
    <nav className="navigation">
      {navigationItems.map(({ page, label, Icon }) => (
        <button
          key={page}
          type="button"
          className={
            activePage === page ? 'nav-button nav-button-active' : 'nav-button'
          }
          onClick={() => onPageChange(page)}
          aria-pressed={activePage === page}
        >
          <Icon aria-hidden="true" size={24} strokeWidth={2.5} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}