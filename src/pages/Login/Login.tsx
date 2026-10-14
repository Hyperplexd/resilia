import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type Role } from '../../auth/AuthContext'
import './Login.css'

const VERIFY_DELAY_MS = 650

const ROLE_COPY: Record<Role, { title: string; desc: string }> = {
  resident: {
    title: 'I live here',
    desc: 'Check your risk, your evacuation route, and your nearest safe zone.',
  },
  authority: {
    title: 'I manage the response',
    desc: 'Run scenarios, deploy units, and compare outcomes across the city.',
  },
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [pendingRole, setPendingRole] = useState<Role | null>(null)

  useEffect(() => {
    if (!pendingRole) return
    const timer = window.setTimeout(() => {
      login(pendingRole)
      navigate('/simulation')
    }, VERIFY_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [pendingRole, login, navigate])

  const verifying = pendingRole !== null

  return (
    <div className="login">
      <div className={`login__mark${verifying ? ' login__mark--pulse' : ''}`} aria-hidden="true" />
      <p className="login__brand">RESILIA</p>
      <h1 className="login__question">
        What happens if wildfire<br />starts here?
      </h1>
      <p className="login__sub">
        Model an ignition anywhere in the city and watch the spread, the traffic,
        the evacuation, and the response unfold minute by minute.
      </p>

      <div className="login__roles" aria-hidden={verifying}>
        {(Object.keys(ROLE_COPY) as Role[]).map((role) => (
          <button
            key={role}
            className={`role-card${role === 'authority' ? ' role-card--authority' : ''}`}
            onClick={() => setPendingRole(role)}
            disabled={verifying}
          >
            <span className="role-card__title">{ROLE_COPY[role].title}</span>
            <span className="role-card__desc">{ROLE_COPY[role].desc}</span>
          </button>
        ))}
      </div>

      <p className="login__status" role="status">
        {verifying ? `Verifying access — ${pendingRole === 'resident' ? 'Resident' : 'Authority'}` : '\u00A0'}
      </p>

      <p className="login__footnote">
        Results are illustrative, built on deterministic demo data &mdash; not a live
        prediction system.
      </p>
    </div>
  )
}
