import { useEffect, useRef, useState } from 'react'
import {
  Users,
  Building2,
  Route,
  ShieldAlert,
  Flame,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { EvacuationMetrics, ImpactMetrics, InfrastructureThreat, NetworkTrafficMetrics } from '../../simulation/simulationTypes'
import './ImpactCards.css'

type ImpactCardsProps = {
  impact: ImpactMetrics
  traffic?: NetworkTrafficMetrics
  evacuation: EvacuationMetrics
  areaHectares: number
  time: number
}

const STATUS_ORDER: Record<InfrastructureThreat['status'], number> = {
  compromised: 3,
  threatened: 2,
  alert: 1,
  safe: 0,
}

export default function ImpactCards({ impact, traffic, evacuation, areaHectares, time }: ImpactCardsProps) {
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [drawerMaxHeight, setDrawerMaxHeight] = useState<number>()

  useEffect(() => {
    if (!expanded) return

    const update = () => {
      const node = containerRef.current
      if (!node) return
      const next = Math.max(160, Math.floor(window.innerHeight - node.getBoundingClientRect().bottom - 20))
      setDrawerMaxHeight((current) => (current === next ? current : next))
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [expanded])

  // Find most critical infrastructure
  const highestInfraThreat = [...impact.threatenedInfrastructure].sort(
    (a, b) => STATUS_ORDER[b.status] - STATUS_ORDER[a.status],
  )[0]

  const infraThreatCount = impact.threatenedInfrastructure.filter(
    (i) => i.status === 'threatened' || i.status === 'compromised',
  ).length

  const blockedCorridors = evacuation.neighborhoods.filter((zone) => zone.routeStatus === 'blocked').length
  const slowCorridors = evacuation.neighborhoods.filter(
    (zone) => zone.routeStatus === 'congested' || zone.routeStatus === 'diverted',
  ).length
  const clearanceCritical = blockedCorridors > 0 || evacuation.clearanceMinutes >= 45
  const clearanceWarning = !clearanceCritical && (slowCorridors > 0 || evacuation.clearanceMinutes >= 20)

  return (
    <div className="impact-container" ref={containerRef}>
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

        {/* Roads & Traffic Flow Card */}
        <div className={`impact-card ${traffic && traffic.chokePointsCount > 0 ? 'impact-card--critical' : impact.roadsBlockedCount > 0 ? 'impact-card--critical' : impact.roadsAffectedCount > 0 ? 'impact-card--warning' : ''}`}>
          <div className="impact-card__header">
            <span className="impact-card__label">
              <Route size={14} className="impact-card__icon" />
              Evacuation Traffic
            </span>
            {traffic && traffic.chokePointsCount > 0 ? (
              <span className="impact-card__badge impact-card__badge--critical">
                {traffic.chokePointsCount} Bottlenecks
              </span>
            ) : impact.roadsBlockedCount > 0 ? (
              <span className="impact-card__badge impact-card__badge--critical">
                {impact.roadsBlockedCount} Blocked
              </span>
            ) : traffic ? (
              <span className="impact-card__badge impact-card__badge--ok">
                {traffic.activeEvacuationThroughput} veh/min
              </span>
            ) : null}
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value">
              {traffic ? (
                <>
                  {traffic.networkAverageSpeedKmh} <small>km/h</small>
                </>
              ) : impact.roadsBlockedCount > 0 ? (
                `${impact.roadsBlockedCount} Blocked`
              ) : (
                'All Clear'
              )}
            </span>
            <span className="impact-card__subtext">
              {traffic
                ? `Avg network speed · ${traffic.totalVehiclesEnRoute} vehicles active`
                : `${impact.roadsAffectedCount} of ${impact.roads.length} routes affected`}
            </span>
          </div>
        </div>

        {/* Evacuation clearance */}
        <div className={`impact-card ${clearanceCritical ? 'impact-card--critical' : clearanceWarning ? 'impact-card--warning' : ''}`}>
          <div className="impact-card__header">
            <span className="impact-card__label">
              <Timer size={14} className="impact-card__icon" />
              Clearance Time
            </span>
            {blockedCorridors > 0 ? (
              <span className="impact-card__badge impact-card__badge--critical">
                {blockedCorridors} Blocked
              </span>
            ) : evacuation.activeOrders > 0 ? (
              <span className="impact-card__badge impact-card__badge--warning">
                {evacuation.activeOrders} Orders
              </span>
            ) : (
              <span className="impact-card__badge impact-card__badge--ok">
                {Math.round(evacuation.progress * 100)}% out
              </span>
            )}
          </div>
          <div className="impact-card__body">
            <span className="impact-card__value data-value">
              {evacuation.clearanceMinutes}
              {evacuation.clearanceMinutes >= 180 ? '+' : ''} <small>min</small>
            </span>
            <span className="impact-card__subtext">
              {evacuation.remainingResidents === 0
                ? 'All neighborhoods clear'
                : evacuation.strandedResidents > 0
                  ? `${evacuation.strandedResidents.toLocaleString()} stranded on closed roads`
                  : `${evacuation.remainingResidents.toLocaleString()} residents still to move`}
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
          aria-expanded={expanded}
          aria-controls="impact-breakdown"
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? 'Hide impact analysis breakdown' : 'View detailed impact breakdown (facilities, roads, evacuation, neighborhoods)'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Breakdown Drawer */}
      {expanded && (
        <div
          className="impact-drawer"
          id="impact-breakdown"
          style={drawerMaxHeight ? { maxHeight: drawerMaxHeight } : undefined}
        >
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

            {/* Roads & Evacuation Traffic Section */}
            <div className="impact-drawer__panel">
              <h4 className="impact-drawer__heading">
                <Route size={14} /> Evacuation Corridors & Congestion
              </h4>
              <div className="impact-drawer__list">
                {impact.roads.map((road) => {
                  const roadTraffic = traffic?.roads.find((r) => r.roadId === road.id)
                  const saturationPct = Math.round((roadTraffic?.saturationRatio ?? 0) * 100)
                  const congestion = roadTraffic?.congestionLevel ?? (road.status === 'blocked' ? 'closed' : 'free_flow')

                  return (
                    <div key={road.id} className={`impact-drawer__item impact-drawer__item--${road.status}`}>
                      <div className="impact-drawer__item-info" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span className="impact-drawer__item-name">{road.name}</span>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {roadTraffic?.isChokePoint && (
                              <span className="impact-status-tag impact-status-tag--blocked" style={{ fontWeight: 700 }}>
                                BOTTLENECK
                              </span>
                            )}
                            <span className={`impact-status-tag impact-status-tag--${congestion}`}>
                              {congestion.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {roadTraffic && (
                          <div className="impact-bar-wrap">
                            <div
                              className={`impact-bar ${saturationPct >= 100 ? 'impact-bar--alert' : ''}`}
                              style={{ width: `${Math.min(100, saturationPct)}%` }}
                            />
                          </div>
                        )}

                        <div className="impact-drawer__item-detail" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                          <span>
                            Speed: <strong>{roadTraffic?.speedKmh ?? 50} km/h</strong> · Load: {roadTraffic?.vehicleCount ?? 0}/{road.capacity} veh ({saturationPct}%)
                          </span>
                          <span>{road.status === 'blocked' ? 'Impassable' : road.distanceToFireMeters > 0 ? `${road.distanceToFireMeters}m to fire` : 'Clear'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Evacuation orders */}
            <div className="impact-drawer__panel">
              <h4 className="impact-drawer__heading">
                <Timer size={14} /> Evacuation Orders
              </h4>
              <div className="impact-drawer__list">
                {evacuation.neighborhoods.map((zone) => {
                  const percent = Math.min(100, Math.round(zone.progress * 100))
                  return (
                    <div key={zone.neighborhoodId} className={`impact-drawer__item impact-drawer__item--${zone.phase}`}>
                      <div className="impact-drawer__item-info" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span className="impact-drawer__item-name">{zone.name}</span>
                          <span className={`impact-status-tag impact-status-tag--${zone.phase}`}>{zone.phase}</span>
                        </div>
                        <div className="impact-bar-wrap">
                          <div
                            className={`impact-bar ${zone.phase === 'cleared' ? 'impact-bar--ok' : zone.phase === 'evacuate' ? 'impact-bar--alert' : ''}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="impact-drawer__item-detail" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span>
                            {percent}% cleared · {zone.remaining.toLocaleString()} left
                          </span>
                          <span>
                            {zone.clearanceMinutes}
                            {zone.clearanceMinutes >= 180 ? '+' : ''} min
                          </span>
                        </div>
                        <div className="impact-drawer__item-detail">
                          Order T+{String(zone.orderMinute).padStart(2, '0')} · {zone.routeLabel}
                        </div>
                        <div className="impact-drawer__item-detail" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <span>{zone.safeZoneName}</span>
                          <span className={`impact-status-tag impact-status-tag--${zone.routeStatus}`}>{zone.routeStatus}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
