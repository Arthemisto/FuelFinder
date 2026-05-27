import type { ReactNode } from 'react'

import type { PageName } from '../../types/page'
import { CredentialsCard } from './CredentialsCard'
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
    <div className="app-shell">
      <div className="top-row">
        <Header />
        <CredentialsCard />
        <StatusPanel />
      </div>

      <Navigation activePage={activePage} onPageChange={onPageChange} />

      <PageContainer>{children}</PageContainer>
    </div>
  )
}