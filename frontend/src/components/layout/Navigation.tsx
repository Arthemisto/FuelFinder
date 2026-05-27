import type { PageName } from '../../types/page'

type NavigationProps = {
  activePage: PageName
  onPageChange: (page: PageName) => void
}

const navigationItems: { page: PageName; label: string }[] = [
  { page: 'search', label: 'Search' },
  { page: 'results', label: 'Results' },
  { page: 'map', label: 'Map' },
  { page: 'analytics', label: 'Analytics' },
  { page: 'stations', label: 'All Stations' },
]

export function Navigation({ activePage, onPageChange }: NavigationProps) {
  return (
    <nav className="navigation">
      {navigationItems.map((item) => (
        <button
          key={item.page}
          type="button"
          className={
            activePage === item.page
              ? 'nav-button nav-button-active'
              : 'nav-button'
          }
          onClick={() => onPageChange(item.page)}
          aria-pressed={activePage === item.page}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}