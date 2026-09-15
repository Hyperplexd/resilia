import { useState } from 'react'
import {
  Users,
  Building2,
  Route,
  ShieldAlert,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { ImpactMetrics, InfrastructureThreat } from '../../simulation/simulationTypes'
import './ImpactCards.css'

type ImpactCardsProps = {
  impact: ImpactMetrics
  areaHectares: number
  time: number
}

const STATUS_ORDER: Record<InfrastructureThreat['status'], number> = {
  compromised: 3,
  threatened: 2,
  alert: 1,
  safe: 0,
}

export default function ImpactCards({ impact, areaHectares, time }: ImpactCardsProps) {
  const [expanded, setExpanded] = useState(false)

  // Find most critical infrastructure
  const highestInfraThreat = [...impact.threatenedInfrastructure].sort(
    (a, b) => STATUS_ORDER[b.status] - STATUS_ORDER[a.status],
  )[0]

  const infraThreatCount = impact.threatenedInfrastructure.filter(
    (i) => i.status === 'threatened' || i.status === 'compromised',
  ).length

  return (
    <div className="impact-container">
      <div className="impact-cards">
        {/* Population Card */}
        <div className={`impact-card ${impact.highRiskResidents > 0 ? 'impact-card--critical' : impact.exposedResidents > 0 ? 'impact-card--warning' : ''}`}>
          <div className="impact-card__header">
            <span className="impact-card__label">
              <Users size={14} className="impact-card__icon" />
              Exposed Residents
            </span>
            {impact.highRiskResidents > 0 && (
              <span className="impact-card__badge impact-card__badge--critical">
                {impact.highRiskResidents.toLocaleString()} High Risk
              </span>
            )}
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value">
              {impact.exposedResidents.toLocaleString()}
            </span>
            <span className="impact-card__subtext">
              {time === 0 ? 'Normal baseline' : `${impact.neighborhoods.filter((n) => n.exposedResidents > 0).length} zones affected`}
            </span>
          </div>
        </div>

        {/* Buildings Card */}
        <div className={`impact-card ${impact.buildingsSeverelyThreatened > 0 ? 'impact-card--critical' : impact.buildingsAtRisk > 0 ? 'impact-card--warning' : ''}`}>
          <div className="impact-card__header">
            <span className="impact-card__label">
              <Building2 size={14} className="impact-card__icon" />
              Buildings at Risk
            </span>
            {impact.buildingsSeverelyThreatened > 0 && (
              <span className="impact-card__badge impact-card__badge--critical">
                {impact.buildingsSeverelyThreatened} Severe
              </span>
            )}
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value">
              {impact.buildingsAtRisk}
            </span>
            <span className="impact-card__subtext">
              {impact.buildingsSeverelyThreatened > 0 ? `${impact.buildingsSeverelyThreatened} in fire perimeter` : 'Smoke / ember threat'}
            </span>
          </div>
        </div>

        {/* Roads Card */}
        <div className={`impact-card ${impact.roadsBlockedCount > 0 ? 'impact-card--critical' : impact.roadsAffectedCount > 0 ? 'impact-card--warning' : ''}`}>
          <div className="impact-card__header">
            <span className="impact-card__label">
              <Route size={14} className="impact-card__icon" />
              Road Network
            </span>
            {impact.roadsBlockedCount > 0 ? (
              <span className="impact-card__badge impact-card__badge--critical">
                {impact.roadsBlockedCount} Blocked
              </span>
            ) : impact.roadsAffectedCount > 0 ? (
              <span className="impact-card__badge impact-card__badge--warning">
                {impact.roadsAffectedCount} Threatened
              </span>
            ) : null}
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value">
              {impact.roadsBlockedCount > 0
                ? `${impact.roadsBlockedCount} Blocked`
                : impact.roadsAffectedCount > 0
                  ? `${impact.roadsAffectedCount} Degraded`
                  : 'All Clear'}
            </span>
            <span className="impact-card__subtext">
              {impact.roadsAffectedCount} of {impact.roads.length} routes affected
            </span>
          </div>
        </div>

        {/* Critical Infrastructure Card */}
        <div className={`impact-card ${highestInfraThreat?.status === 'compromised' || highestInfraThreat?.status === 'threatened' ? 'impact-card--critical' : highestInfraThreat?.status === 'alert' ? 'impact-card--warning' : ''}`}>
          <div className="impact-card__header">
            <span className="impact-card__label">
              <ShieldAlert size={14} className="impact-card__icon" />
              Critical Facilities
            </span>
            {infraThreatCount > 0 && (
              <span className="impact-card__badge impact-card__badge--critical">
                {infraThreatCount} Threat
              </span>
            )}
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value" style={{ fontSize: highestInfraThreat && highestInfraThreat.status !== 'safe' ? '17px' : '22px' }}>
              {highestInfraThreat && highestInfraThreat.status !== 'safe'
                ? `${highestInfraThreat.name.split(' ')[0]} ${highestInfraThreat.status.toUpperCase()}`
                : 'All 5 Operational'}
            </span>
            <span className="impact-card__subtext">
              {highestInfraThreat && highestInfraThreat.status !== 'safe'
                ? `Proximity: ${highestInfraThreat.distanceToFireMeters}m to fire`
                : 'No immediate threat'}
            </span>
          </div>
        </div>

        {/* Fire Dynamics Card */}
        <div className="impact-card">
          <div className="impact-card__header">
            <span className="impact-card__label">
              <Flame size={14} className="impact-card__icon impact-card__icon--fire" />
              Fire Front Dynamics
            </span>
            <span className="impact-card__badge">
              T+{String(time).padStart(2, '0')}m
            </span>
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value">
              {areaHectares.toFixed(1)} <small>ha</small>
            </span>
            <span className="impact-card__subtext">
              Perimeter: {impact.perimeterKm.toFixed(1)} km · {impact.spreadRateMetersPerMin} m/min
            </span>
          </div>
        </div>
      </div>

      {/* Details Toggle Button */}
      <div className="impact-drawer__toggle-bar">
        <button
          type="button"
          className={`impact-drawer__toggle-btn ${expanded ? 'impact-drawer__toggle-btn--active' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? 'Hide impact analysis breakdown' : 'View detailed impact breakdown (facilities, roads, neighborhoods)'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Breakdown Drawer */}
      {expanded && (
        <div className="impact-drawer">
          <div className="impact-drawer__grid">
            {/* Critical Facilities Section */}
            <div className="impact-drawer__panel">
              <h4 className="impact-drawer__heading">
                <ShieldAlert size={14} /> Critical Infrastructure
              </h4>
              <div className="impact-drawer__list">
                {impact.threatenedInfrastructure.map((infra) => (
                  <div key={infra.id} className={`impact-drawer__item impact-drawer__item--${infra.status}`}>
                    <div className="impact-drawer__item-info">
                      <span className="impact-drawer__item-name">{infra.name}</span>
                      <span className="impact-drawer__item-detail">
                        {infra.status === 'safe'
                          ? 'Perimeter clear'
                          : `Fire proximity: ${infra.distanceToFireMeters} m`}
                      </span>
                    </div>
                    <span className={`impact-status-tag impact-status-tag--${infra.status}`}>
                      {infra.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roads Disruption Section */}
            <div className="impact-drawer__panel">
              <h4 className="impact-drawer__heading">
                <Route size={14} /> Road Disruption Status
              </h4>
              <div className="impact-drawer__list">
                {impact.roads.map((road) => (
                  <div key={road.id} className={`impact-drawer__item impact-drawer__item--${road.status}`}>
                    <div className="impact-drawer__item-info">
                      <span className="impact-drawer__item-name">{road.name}</span>
                      <span className="impact-drawer__item-detail">
                        Capacity: {road.capacity} veh/min · {road.status === 'blocked' ? 'Road impassable' : road.distanceToFireMeters > 0 ? `Proximity: ${road.distanceToFireMeters}m` : 'Clear'}
                      </span>
                    </div>
                    <span className={`impact-status-tag impact-status-tag--${road.status}`}>
                      {road.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhoods Section */}
            <div className="impact-drawer__panel">
              <h4 className="impact-drawer__heading">
                <Building2 size={14} /> Neighborhood Exposure
              </h4>
              <div className="impact-drawer__list">
                {impact.neighborhoods.map((hood) => {
                  const percent = Math.min(100, Math.round((hood.exposedResidents / hood.totalPopulation) * 100))
                  return (
                    <div key={hood.id} className={`impact-drawer__item impact-drawer__item--${hood.status}`}>
                      <div className="impact-drawer__item-info" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="impact-drawer__item-name">{hood.name}</span>
                          <span className={`impact-status-tag impact-status-tag--${hood.status}`}>
                            {hood.status}
                          </span>
                        </div>
                        <div className="impact-bar-wrap">
                          <div
                            className={`impact-bar ${hood.status === 'evacuate' || hood.status === 'warning' ? 'impact-bar--alert' : ''}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="impact-drawer__item-detail" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{hood.exposedResidents.toLocaleString()} / {hood.totalPopulation.toLocaleString()} residents ({percent}%)</span>
                          <span>{hood.buildingsAtRisk} / {hood.totalBuildings} bldgs</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
