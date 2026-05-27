import type { ReactNode } from 'react'

import type { PageName } from '../../types/page'
import { Header } from './Header'
import { Navigation } from './Navigation'
import { PageContainer } from './PageContainer'
import { StatusPanel } from './StatusPanel'

type AppLayoutProps = {
  activePage: PageName
  onPageChange: (page: PageName) => void
  children: ReactNode
}

export function AppLayout({
  activePage,
  onPageChange,
  children,
}: AppLayoutProps) {
  return (
    <div>
      <div>
        <Header />
        <StatusPanel />
      </div>

      <Navigation activePage={activePage} onPageChange={onPageChange} />

      <PageContainer>{children}</PageContainer>
    </div>
  )
}