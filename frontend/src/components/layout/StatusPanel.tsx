export function StatusPanel() {
  return (
    <aside className="status-panel">
      <dl>
        <div>
          <dt>version</dt>
          <dd>1.0.0</dd>
        </div>

        <div>
          {/* TODO: show green or red indicator based on database connection status */}
          <dt>DB Connection</dt>
          <dd>
            <span className="status-dot" aria-label="Database is online" />
          </dd>
          
        </div>

        <div>
          {/* TODO: fetch latest database update timestamp from backend */}
          <dt>updated time stamp</dt>
          <dd>May 25, 2025 10:30 AM</dd>
        </div>
      </dl>
    </aside>
  )
}