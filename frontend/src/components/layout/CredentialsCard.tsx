import { User } from 'lucide-react'

export function CredentialsCard() {
  return (
    <section className="credentials-card">
      <div className="credentials-icon">
        <User aria-hidden="true" size={28} strokeWidth={2.4} />
      </div>

      <div className="credentials-text">
        <span>Developed by</span>
        <strong>Arthemisto</strong>
        <span>st89273</span>
      </div>
    </section>
  )
}