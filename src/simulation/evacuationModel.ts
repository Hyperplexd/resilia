import { INFRASTRUCTURE, NEIGHBORHOODS, ROADS } from '../data/demoCity'
import type {
  EvacuationMetrics,
  EvacuationPhase,
  EvacuationRouteStatus,
  ImpactMetrics,
  LngLat,
  NeighborhoodEvacuation,
  NetworkTrafficMetrics,
  SafeZoneState,
  ScenarioInput,
} from './simulationTypes'

const WARNING_LEAD_MIN = 5
const ADVISORY_LEAD_MIN = 10
const VOLUNTARY_RATE = 0.22
const CLEARANCE_CAP_MIN = 180
const ORDER_MINUTE_CAP = 45

type RouteOption = {
  safeZoneId: string
  roadIds: string[]
}

type NeighborhoodPlan = {
  neighborhoodId: string
  /** Minute the mandatory order is issued before scenario shifts. */
  baseEvacuateMinute: number
  /** Residents per minute on a free-flow corridor. */
  peoplePerMin: number
  options: RouteOption[]
}

type SafeZoneDef = {
  id: string
  name: string
  kind: SafeZoneState['kind']
  position: LngLat
  facilityId?: string
}

function facilityPosition(id: string): LngLat {
  const facility = INFRASTRUCTURE.find((item) => item.id === id)
  if (!facility) throw new Error(`Missing facility ${id}`)
  return facility.position
}

const southGate = ROADS.find((road) => road.id === 'hollow-creek-lane')
if (!southGate) throw new Error('Missing Hollow Creek Lane')

const SAFE_ZONES: SafeZoneDef[] = [
  {
    id: 'central-shelter',
    name: 'Central Avenue Shelter',
    kind: 'shelter',
    position: facilityPosition('central-shelter'),
    facilityId: 'central-shelter',
  },
  {
    id: 'cedar-elementary',
    name: 'Cedar Ridge Elementary',
    kind: 'school',
    position: facilityPosition('cedar-elementary'),
    facilityId: 'cedar-elementary',
  },
  {
    id: 'south-gate',
    name: 'South Perimeter Gate',
    kind: 'perimeter',
    position: southGate.points[southGate.points.length - 1],
  },
]

const ZONE_BY_ID = new Map(SAFE_ZONES.map((zone) => [zone.id, zone]))

// Phased orders: ridge first, then the village, the creek, and town last.
// Each plan lists a primary corridor and fallbacks used when that shelter
// or road is no longer usable.
const PLANS: NeighborhoodPlan[] = [
  {
    neighborhoodId: 'lower-village',
    baseEvacuateMinute: 14,
    peoplePerMin: 105,
    options: [
      { safeZoneId: 'central-shelter', roadIds: ['central-ave'] },
      { safeZoneId: 'cedar-elementary', roadIds: ['central-ave'] },
      { safeZoneId: 'south-gate', roadIds: ['hollow-creek-lane'] },
    ],
  },
  {
    neighborhoodId: 'ridgeline',
    baseEvacuateMinute: 8,
    peoplePerMin: 78,
    options: [
      { safeZoneId: 'central-shelter', roadIds: ['ridgeline-drive', 'mountain-road', 'central-ave'] },
      { safeZoneId: 'cedar-elementary', roadIds: ['ridgeline-drive', 'mountain-road', 'central-ave'] },
      { safeZoneId: 'south-gate', roadIds: ['ridgeline-drive', 'mountain-road', 'hollow-creek-lane'] },
    ],
  },
  {
    neighborhoodId: 'town-center',
    baseEvacuateMinute: 24,
    peoplePerMin: 125,
    options: [
      { safeZoneId: 'cedar-elementary', roadIds: ['central-ave'] },
      { safeZoneId: 'central-shelter', roadIds: ['central-ave'] },
      { safeZoneId: 'south-gate', roadIds: ['hollow-creek-lane'] },
    ],
  },
  {
    neighborhoodId: 'creekside',
    baseEvacuateMinute: 18,
    peoplePerMin: 58,
    options: [
      { safeZoneId: 'south-gate', roadIds: ['hollow-creek-lane'] },
      { safeZoneId: 'central-shelter', roadIds: ['central-ave'] },
      { safeZoneId: 'cedar-elementary', roadIds: ['central-ave'] },
    ],
  },
]

const PLAN_BY_ID = new Map(PLANS.map((plan) => [plan.neighborhoodId, plan]))

function scenarioShift(scenario: ScenarioInput): number {
  let shift = 0
  if (scenario.severity === 'severe') shift -= 4
  else if (scenario.severity === 'low') shift += 5
  if (scenario.dryness === 'high') shift -= 2
  else if (scenario.dryness === 'low') shift += 3
  if (scenario.windSpeed === 'high') shift -= 2
  else if (scenario.windSpeed === 'low') shift += 2
  return shift
}

function orderMinuteFor(plan: NeighborhoodPlan, scenario: ScenarioInput): number {
  return Math.max(0, Math.min(ORDER_MINUTE_CAP, plan.baseEvacuateMinute + scenarioShift(scenario)))
}

function zoneUsable(zoneId: string, impact: ImpactMetrics): boolean {
  const zone = ZONE_BY_ID.get(zoneId)
  if (!zone?.facilityId) return true
  const threat = impact.threatenedInfrastructure.find((item) => item.id === zone.facilityId)
  if (!threat) return true
  return threat.status === 'safe' || threat.status === 'alert'
}

function corridorFactor(roadIds: string[], impact: ImpactMetrics, traffic: NetworkTrafficMetrics) {
  let speedSum = 0
  let blocked = false
  let congested = false
  for (const id of roadIds) {
    const impactRoad = impact.roads.find((road) => road.id === id)
    const flow = traffic.roads.find((road) => road.roadId === id)
    if (impactRoad?.status === 'blocked' || flow?.congestionLevel === 'closed' || flow?.flowDirection === 'blocked') {
      blocked = true
    }
    if (
      flow?.congestionLevel === 'heavy' ||
      flow?.congestionLevel === 'standstill' ||
      impactRoad?.status === 'threatened'
    ) {
      congested = true
    }
    speedSum += flow?.speedKmh ?? 46
  }
  if (blocked) return { blocked: true, congested: true, factor: 0.08 }
  const average = speedSum / Math.max(1, roadIds.length)
  const factor = Math.max(0.22, Math.min(1, average / 50))
  return { blocked: false, congested: congested || factor < 0.62, factor }
}

function routeLabel(roadIds: string[]): string {
  return roadIds.map((id) => ROADS.find((road) => road.id === id)?.name ?? id).join(' → ')
}

function selectRoute(plan: NeighborhoodPlan, impact: ImpactMetrics, traffic: NetworkTrafficMetrics) {
  const evaluated = plan.options.map((option, index) => ({
    option,
    index,
    usable: zoneUsable(option.safeZoneId, impact),
    corridor: corridorFactor(option.roadIds, impact, traffic),
  }))
  const chosen = evaluated.find((item) => item.usable && !item.corridor.blocked) ??
    evaluated.find((item) => item.usable) ??
    evaluated[0]
  const zone = ZONE_BY_ID.get(chosen.option.safeZoneId)
  if (!zone) throw new Error(`Unknown safe zone ${chosen.option.safeZoneId}`)
  const primaryRoads = plan.options[0].roadIds.join('|')
  const differentRoads = chosen.option.roadIds.join('|') !== primaryRoads
  let routeStatus: EvacuationRouteStatus = 'open'
  if (chosen.corridor.blocked) routeStatus = 'blocked'
  else if (differentRoads) routeStatus = 'diverted'
  else if (chosen.corridor.congested) routeStatus = 'congested'
  return {
    zone,
    roadIds: chosen.option.roadIds,
    routeStatus,
    factor: chosen.corridor.factor,
    label: routeLabel(chosen.option.roadIds),
  }
}

function overlapMinutes(from: number, to: number, start: number, end: number): number {
  return Math.max(0, Math.min(to, end) - Math.max(from, start))
}

function departedDuring(previousTime: number, time: number, orderMinute: number, rate: number, remaining: number): number {
  if (time <= previousTime || remaining <= 0 || rate <= 0) return 0
  const warningStart = Math.max(0, orderMinute - WARNING_LEAD_MIN)
  const warningMinutes = overlapMinutes(previousTime, time, warningStart, orderMinute)
  const evacuateMinutes = overlapMinutes(previousTime, time, orderMinute, Number.POSITIVE_INFINITY)
  return Math.min(remaining, rate * (warningMinutes * VOLUNTARY_RATE + evacuateMinutes))
}

function phaseFor(time: number, orderMinute: number, remaining: number): EvacuationPhase {
  if (remaining <= 0) return 'cleared'
  if (time >= orderMinute) return 'evacuate'
  if (time >= Math.max(0, orderMinute - WARNING_LEAD_MIN)) return 'warning'
  if (time >= Math.max(0, orderMinute - ADVISORY_LEAD_MIN)) return 'advisory'
  return 'standby'
}

function capMinutes(value: number): number {
  return Math.min(CLEARANCE_CAP_MIN, Math.max(0, Math.ceil(value)))
}

function clearanceMinutesFor(time: number, orderMinute: number, remaining: number, rate: number, phase: EvacuationPhase): number {
  if (remaining <= 0) return 0
  const flow = Math.max(rate, 1)
  if (phase === 'standby' || phase === 'advisory') {
    const movementStart = Math.max(0, orderMinute - WARNING_LEAD_MIN)
    const warningDuration = Math.max(0, orderMinute - movementStart)
    const wait = Math.max(0, movementStart - time)
    const duringWarning = Math.min(remaining, flow * VOLUNTARY_RATE * warningDuration)
    const afterWarning = remaining - duringWarning
    return capMinutes(wait + warningDuration + afterWarning / flow)
  }
  if (phase === 'warning') {
    const warnLeft = Math.max(0, orderMinute - time)
    const duringWarning = Math.min(remaining, flow * VOLUNTARY_RATE * warnLeft)
    const afterWarning = remaining - duringWarning
    return capMinutes((duringWarning > 0 ? warnLeft : 0) + afterWarning / flow)
  }
  return capMinutes(remaining / flow)
}

/**
 * Advances evacuation from the previous frame to `time`.
 * Departure is accumulated by the engine so progress never runs backwards
 * when a later frame is more congested — only the rate changes.
 */
export function advanceEvacuation(
  time: number,
  previousTime: number,
  impact: ImpactMetrics,
  traffic: NetworkTrafficMetrics,
  scenario: ScenarioInput,
  evacuatedByNeighborhood: Record<string, number>,
  /** Road conditions at the start of this step. Departures over the step use these, so a road that closes at the end of the step does not erase the people who already left. */
  departureConditions?: { impact: ImpactMetrics; traffic: NetworkTrafficMetrics } | null,
): { metrics: EvacuationMetrics; evacuatedByNeighborhood: Record<string, number> } {
  const nextEvacuated = { ...evacuatedByNeighborhood }
  const neighborhoods: NeighborhoodEvacuation[] = NEIGHBORHOODS.map((hood) => {
    const plan = PLAN_BY_ID.get(hood.id)
    if (!plan) throw new Error(`Missing evacuation plan for ${hood.id}`)
    const orderMinute = orderMinuteFor(plan, scenario)
    const already = nextEvacuated[hood.id] ?? 0
    const remainingBefore = Math.max(0, hood.population - already)
    const route = selectRoute(plan, impact, traffic)
    const departureRoute = departureConditions
      ? selectRoute(plan, departureConditions.impact, departureConditions.traffic)
      : route
    const rate = plan.peoplePerMin * departureRoute.factor
    let exact = Math.min(hood.population, already + departedDuring(previousTime, time, orderMinute, rate, remainingBefore))
    if (hood.population - exact < 0.5) exact = hood.population
    nextEvacuated[hood.id] = exact
    const evacuated = Math.round(exact)
    const remaining = hood.population - evacuated
    const phase = phaseFor(time, orderMinute, remaining)
    return {
      neighborhoodId: hood.id,
      name: hood.name,
      phase,
      population: hood.population,
      evacuated,
      remaining,
      progress: hood.population === 0 ? 1 : exact / hood.population,
      clearanceMinutes: clearanceMinutesFor(time, orderMinute, remaining, plan.peoplePerMin * route.factor, phase),
      orderMinute,
      safeZoneId: route.zone.id,
      safeZoneName: route.zone.name,
      routeLabel: route.label,
      routeStatus: route.routeStatus,
      roadIds: route.roadIds,
    }
  })

  const population = neighborhoods.reduce((sum, zone) => sum + zone.population, 0)
  const evacuatedResidents = neighborhoods.reduce((sum, zone) => sum + zone.evacuated, 0)
  const remainingResidents = population - evacuatedResidents
  const stillMoving = neighborhoods.filter((zone) => zone.remaining > 0 && zone.routeStatus !== 'blocked')
  const stillWaiting = neighborhoods.filter((zone) => zone.remaining > 0)
  const clearancePool = stillMoving.length > 0 ? stillMoving : stillWaiting
  const strandedResidents = neighborhoods
    .filter((zone) => zone.routeStatus === 'blocked')
    .reduce((sum, zone) => sum + zone.remaining, 0)
  const safeZones: SafeZoneState[] = SAFE_ZONES.map((zone) => {
    const assigned = neighborhoods.filter(
      (item) => item.safeZoneId === zone.id && item.phase !== 'standby' && item.phase !== 'advisory',
    )
    return {
      id: zone.id,
      name: zone.name,
      kind: zone.kind,
      position: zone.position,
      facilityId: zone.facilityId,
      usable: zoneUsable(zone.id, impact),
      assignedNeighborhoods: assigned.length,
      activeInflow: assigned.filter((item) => item.phase === 'warning' || item.phase === 'evacuate').length,
    }
  })
  const safeCorridorRoadIds = [
    ...new Set(
      neighborhoods
        .filter((zone) => (zone.phase === 'warning' || zone.phase === 'evacuate') && zone.routeStatus !== 'blocked')
        .flatMap((zone) => zone.roadIds),
    ),
  ]

  return {
    evacuatedByNeighborhood: nextEvacuated,
    metrics: {
      clearanceMinutes: clearancePool.length === 0 ? 0 : Math.max(...clearancePool.map((zone) => zone.clearanceMinutes)),
      evacuatedResidents,
      remainingResidents,
      strandedResidents,
      progress: population === 0 ? 1 : evacuatedResidents / population,
      activeOrders: neighborhoods.filter((zone) => zone.phase === 'evacuate').length,
      neighborhoods,
      safeZones,
      safeCorridorRoadIds,
    },
  }
}
