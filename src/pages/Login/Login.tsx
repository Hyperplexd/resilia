import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="login">
      <div className="login__mark" aria-hidden="true" />
      <p className="login__brand">RESILIA</p>
      <h1 className="login__question">
        What happens if wildfire<br />starts here?
      </h1>
      <p className="login__sub">
        Model an ignition anywhere in the city and watch the spread, the traffic,
        the evacuation, and the response unfold minute by minute.
      </p>

      <div className="login__roles">
        <button className="role-card" onClick={() => navigate('/resident')}>
          <span className="role-card__title">I live here</span>
          <span className="role-card__desc">
            Check your risk, your evacuation route, and your nearest safe zone.
          </span>
        </button>
        <button className="role-card role-card--authority" onClick={() => navigate('/authority')}>
          <span className="role-card__title">I manage the response</span>
          <span className="role-card__desc">
            Run scenarios, deploy units, and compare outcomes across the city.
          </span>
        </button>
      </div>

      <p className="login__footnote">
        Results are illustrative, built on deterministic demo data &mdash; not a live
        prediction system.
      </p>
    </div>
  )
}
