import { useNavigate } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import './Authority.css'

export default function AuthorityPage() {
  const navigate = useNavigate()
  return (
    <Shell>
      <div className="placeholder">
        <p className="placeholder__label">Authority</p>
        <p className="placeholder__note">
          Access granted. Scenario controls and KPIs are built in a later
          phase.
        </p>
        <button className="placeholder__link" onClick={() => navigate('/simulation')}>
          View digital twin
        </button>
      </div>
    </Shell>
  )
}
