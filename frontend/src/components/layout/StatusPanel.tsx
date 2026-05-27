export function StatusPanel() {
  return (
    <aside>
      <dl>
        <div>
          <dt>version</dt>
          <dd>1.0.0</dd>
        </div>

        <div>
            {/* to do : green or red indicator showing db connection status */}
          <dt>db indicator</dt>
          <dd>light color</dd>
        </div>

        <div>
            {/* to do: connection logic to db and fetch last updates */}
          <dt>updated time stamp</dt>
          <dd>May 25, 2025 10:30 AM</dd>
        </div>
      </dl>
    </aside>
  )
}