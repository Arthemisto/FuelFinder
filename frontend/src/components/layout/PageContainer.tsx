import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return <section>{children}</section>
}