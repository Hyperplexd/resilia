import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Flame, ShieldAlert, Radio } from 'lucide-react'
import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import ImpactCards from '../../components/metrics/ImpactCards'
import { CITY_CENTER, IGNITION_POINT } from '../../data/demoCity'
import { useSimulation } from '../../hooks/useSimulation'
import './Authority.css'

export default function AuthorityPage() {
  const navigate = useNavigate()
  // Use current hero simulation at T+15 (when impact is clearly active)
  const sim = useSimulation(IGNITION_POINT.position)
  const activeFrame = sim.frames[3] // T+15 min snapshot for dashboard briefing

  return (
    <Shell>
      <div className="authority-dashboard">
        {/* Ops Center Header */}
        <header className="authority-header">
          <div className="authority-header__left">
            <div className="authority-header__status-badge">
              <span className="authority-header__dot" />
              <Radio size={13} />
              <span>INCIDENT COMMAND ACTIVE</span>
            </div>
            <h1 className="authority-header__title">Cedar Ridge Civil Protection & Emergency Operations</h1>
            <p className="authority-header__meta">
              Simulated Wildfire Incident · <strong className="data-value">T+15 min</strong> Operational Horizon · 4 Neighborhoods Monitored
            </p>
          </div>
          <button className="authority-header__launch-btn" onClick={() => navigate('/simulation')}>
            <span>Launch Digital Twin</span>
            <ArrowRight size={16} />
          </button>
        </header>

        {/* Live KPI Strip from active simulation frame */}
        <ImpactCards
          impact={activeFrame.impact}
          traffic={activeFrame.traffic}
          areaHectares={activeFrame.areaHectares}
          time={activeFrame.time}
        />

        {/* Command Center Main Grid */}
        <div className="authority-grid">
          {/* Situation Briefing */}
          <div className="authority-panel">
            <h3 className="authority-panel__title">
              <AlertTriangle size={15} className="authority-panel__icon--warn" />
              Incident Impact Assessment
            </h3>
            <div className="authority-briefing">
              <div className="authority-briefing__item">
                <span className="authority-briefing__label">Primary Front Direction</span>
                <strong className="authority-briefing__value">Southwest toward Ridgeline & Lower Village</strong>
              </div>
              <div className="authority-briefing__item">
                <span className="authority-briefing__label">High Risk Population</span>
                <strong className="authority-briefing__value text-critical">
                  {activeFrame.impact.highRiskResidents.toLocaleString()} Residents ({activeFrame.impact.exposedResidents.toLocaleString()} total exposed)
                </strong>
              </div>
              <div className="authority-briefing__item">
                <span className="authority-briefing__label">Evacuation Traffic</span>
                <strong className="authority-briefing__value text-warn">
                  {activeFrame.traffic.networkAverageSpeedKmh} km/h avg · {activeFrame.traffic.chokePointsCount} active bottlenecks ({activeFrame.traffic.totalVehiclesEnRoute} vehicles en route)
                </strong>
              </div>
              <div className="authority-briefing__item">
                <span className="authority-briefing__label">Road Disruption</span>
                <strong className="authority-briefing__value text-warn">
                  {activeFrame.impact.roadsBlockedCount} Blocked · {activeFrame.impact.roadsAffectedCount} routes under hazard
                </strong>
              </div>
              <div className="authority-briefing__item">
                <span className="authority-briefing__label">Critical Infrastructure Alert</span>
                <strong className="authority-briefing__value text-critical">
                  {activeFrame.impact.threatenedInfrastructure.find((i) => i.status !== 'safe')?.name ?? 'Perimeter clear'} (
                  {activeFrame.impact.threatenedInfrastructure.find((i) => i.status !== 'safe')?.distanceToFireMeters}m proximity)
                </strong>
              </div>
            </div>

            <div className="authority-panel__action-box">
              <p className="authority-panel__action-text">
                Explore the complete timeline progression from ignition (T+00) to T+30 minutes, adjust wind and severity parameters, and analyze spread rates in real time.
              </p>
              <button className="authority-btn authority-btn--primary" onClick={() => navigate('/simulation')}>
                <Flame size={15} /> Open Live Simulation
              </button>
            </div>
          </div>

          {/* Mini Twin Map Snapshot */}
          <div className="authority-map-panel">
            <div className="authority-map-panel__header">
              <span className="authority-panel__title">
                <ShieldAlert size={15} />
                Live Situational Map Snapshot (T+15m)
              </span>
              <button className="authority-link-btn" onClick={() => navigate('/simulation')}>
                Full screen map →
              </button>
            </div>
            <div className="authority-map-wrap">
              <CityMap
                center={{ lat: CITY_CENTER[1], lng: CITY_CENTER[0] }}
                zoom={14}
                pitch={50}
                showTwin
                fireFrame={activeFrame}
              />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
