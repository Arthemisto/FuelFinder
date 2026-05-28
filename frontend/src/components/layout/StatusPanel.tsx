import { useEffect, useState } from 'react'

import { getStatus, type StatusResponse } from '../../api/fuelFinderApi'

function formatStatusTimestamp(timestamp: string | null): string {
  if (!timestamp) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

export function StatusPanel() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const apiStatus = await getStatus()

        setStatus(apiStatus)
        setIsOnline(
          apiStatus.backendStatus === 'online' &&
            apiStatus.databaseStatus === 'connected',
        )
      } catch {
        setStatus(null)
        setIsOnline(false)
      }
    }

    void loadStatus()
  }, [])

  return (
    <aside className="status-panel">
      <dl>
        <div>
          <dt>version</dt>
          <dd>{status?.version ?? 'unknown'}</dd>
        </div>

        <div>
          <dt>DB Connection</dt>
          <dd>
            <span
              className={
                isOnline ? 'status-dot status-dot-online' : 'status-dot'
              }
              aria-label={isOnline ? 'Database is online' : 'Database is offline'}
            />
          </dd>
        </div>

        <div>
          <dt>updated time stamp</dt>
          <dd>{formatStatusTimestamp(status?.lastPriceUpdate ?? null)}</dd>
        </div>
      </dl>
    </aside>
  )
}