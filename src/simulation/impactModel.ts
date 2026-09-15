import { ROADS, NEIGHBORHOODS, INFRASTRUCTURE, type LngLat } from '../data/demoCity'
import { fireRadiusAt, smokeRadiusAt } from './fireModel'
import type {
  ImpactMetrics,
  InfrastructureThreat,
  NeighborhoodImpact,
  RoadImpact,
  ScenarioInput,
} from './simulationTypes'

const METERS_PER_DEG_LAT = 111_320

function metersPerDegLng(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)
}

/**
 * Calculates distance (in meters) from a target point to the active fire front
 * along the ray from the ignition origin.
 * Also returns whether the target point is inside the smoke plume.
 */
export function evaluatePointAgainstFire(
  point: LngLat,
  ignition: LngLat,
  time: number,
  scenario: ScenarioInput,
): { distanceToFireMeters: number; insideFire: boolean; insideSmoke: boolean } {
  if (time === 0) {
    return { distanceToFireMeters: 9999, insideFire: false, insideSmoke: false }
  }

  const [lng, lat] = point
  const [lng0, lat0] = ignition
  const mLng = metersPerDegLng(lat0)

  const dx = (lng - lng0) * mLng
  const dy = (lat - lat0) * METERS_PER_DEG_LAT
  const distToIgnition = Math.sqrt(dx * dx + dy * dy)
  const theta = Math.atan2(dy, dx)

  const fireR = fireRadiusAt(theta, time, scenario)
  const smokeR = smokeRadiusAt(theta, time, scenario)

  const insideFire = distToIgnition <= fireR
  const insideSmoke = distToIgnition <= smokeR
  const distanceToFireMeters = insideFire ? 0 : Math.round(distToIgnition - fireR)

  return { distanceToFireMeters, insideFire, insideSmoke }
}

/**
 * Evaluates threat status for all 5 critical infrastructure facilities.
 */
function evaluateInfrastructure(
  ignition: LngLat,
  time: number,
  scenario: ScenarioInput,
): InfrastructureThreat[] {
  return INFRASTRUCTURE.map((infra) => {
    const { distanceToFireMeters, insideFire, insideSmoke } = evaluatePointAgainstFire(
      infra.position,
      ignition,
      time,
      scenario,
    )

    let status: InfrastructureThreat['status'] = 'safe'
    if (insideFire || distanceToFireMeters <= 25) {
      status = 'compromised'
    } else if (distanceToFireMeters <= 260 || (insideSmoke && distanceToFireMeters <= 420)) {
      status = 'threatened'
    } else if (insideSmoke || distanceToFireMeters <= 680) {
      status = 'alert'
    }

    return {
      id: infra.id,
      name: infra.name,
      type: infra.type,
      position: infra.position,
      distanceToFireMeters,
      status,
    }
  })
}

/**
 * Evaluates disruption status for roads by sampling points along each route.
 */
function evaluateRoads(
  ignition: LngLat,
  time: number,
  scenario: ScenarioInput,
): RoadImpact[] {
  return ROADS.map((road) => {
    let minDistance = 9999
    let hasPointInFire = false
    let hasPointInSmoke = false

    // Sample vertices and segment midpoints for accurate detection
    const samplePoints: LngLat[] = []
    for (let i = 0; i < road.points.length; i++) {
      samplePoints.push(road.points[i])
      if (i < road.points.length - 1) {
        const p1 = road.points[i]
        const p2 = road.points[i + 1]
        samplePoints.push([(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2])
      }
    }

    for (const pt of samplePoints) {
      const { distanceToFireMeters, insideFire, insideSmoke } = evaluatePointAgainstFire(
        pt,
        ignition,
        time,
        scenario,
      )
      if (insideFire) hasPointInFire = true
      if (insideSmoke) hasPointInSmoke = true
      if (distanceToFireMeters < minDistance) minDistance = distanceToFireMeters
    }

    let status: RoadImpact['status'] = 'clear'
    if (time > 0) {
      if (hasPointInFire || minDistance <= 20) {
        status = 'blocked'
      } else if (minDistance <= 160) {
        status = 'threatened'
      } else if (hasPointInSmoke || minDistance <= 320) {
        status = 'smoke_hazard'
      }
    }

    return {
      id: road.id,
      name: road.name,
      capacity: road.capacity,
      distanceToFireMeters: minDistance === 9999 ? 0 : minDistance,
      status,
    }
  })
}

/**
 * Evaluates population exposure and buildings at risk across neighborhoods.
 */
function evaluateNeighborhoods(
  ignition: LngLat,
  time: number,
  scenario: ScenarioInput,
): NeighborhoodImpact[] {
  return NEIGHBORHOODS.map((hood) => {
    if (time === 0) {
      return {
        id: hood.id,
        name: hood.name,
        totalPopulation: hood.population,
        totalBuildings: hood.buildings,
        exposedResidents: 0,
        highRiskResidents: 0,
        buildingsAtRisk: 0,
        buildingsSeverelyThreatened: 0,
        status: 'clear' as const,
      }
    }

    // Sample boundary corners and centroid
    const points = hood.boundary
    let firePoints = 0
    let smokePoints = 0
    let minDistance = 9999

    for (const pt of points) {
      const { distanceToFireMeters, insideFire, insideSmoke } = evaluatePointAgainstFire(
        pt,
        ignition,
        time,
        scenario,
      )
      if (insideFire) firePoints++
      if (insideSmoke) smokePoints++
      if (distanceToFireMeters < minDistance) minDistance = distanceToFireMeters
    }

    const fireRatio = firePoints / points.length
    const smokeRatio = smokePoints / points.length

    // Proximity factor when fire is approaching within 400m
    const proximityThreat = minDistance < 400 ? (400 - minDistance) / 400 : 0

    // Exposure calculations
    const exposureRatio = Math.min(1, Math.max(0, smokeRatio * 0.85 + fireRatio * 0.35 + proximityThreat * 0.4))
    const highRiskRatio = Math.min(1, Math.max(0, fireRatio * 1.0 + (smokeRatio > 0.5 ? 0.3 : 0) + (minDistance < 150 ? 0.4 : 0)))

    const exposedResidents = Math.min(
      hood.population,
      Math.round(hood.population * exposureRatio * hood.vulnerabilityFactor),
    )
    const highRiskResidents = Math.min(
      exposedResidents,
      Math.round(hood.population * highRiskRatio),
    )

    const buildingsAtRisk = Math.min(
      hood.buildings,
      Math.round(hood.buildings * exposureRatio * 1.05),
    )
    const buildingsSeverelyThreatened = Math.min(
      buildingsAtRisk,
      Math.round(hood.buildings * highRiskRatio),
    )

    let status: NeighborhoodImpact['status'] = 'clear'
    if (fireRatio >= 0.25 || highRiskResidents > hood.population * 0.35) {
      status = 'evacuate'
    } else if (fireRatio > 0 || smokeRatio >= 0.4 || highRiskResidents > 0) {
      status = 'warning'
    } else if (smokeRatio > 0 || exposedResidents > 0) {
      status = 'advisory'
    }

    return {
      id: hood.id,
      name: hood.name,
      totalPopulation: hood.population,
      totalBuildings: hood.buildings,
      exposedResidents,
      highRiskResidents,
      buildingsAtRisk,
      buildingsSeverelyThreatened,
      status,
    }
  })
}

/**
 * Calculates perimeter length in kilometers from a closed ring.
 */
function calculatePerimeterKm(ring: LngLat[], center: LngLat): number {
  const [, lat0] = center
  const mLng = metersPerDegLng(lat0)
  let totalMeters = 0

  for (let i = 0; i < ring.length - 1; i++) {
    const dx = (ring[i + 1][0] - ring[i][0]) * mLng
    const dy = (ring[i + 1][1] - ring[i][1]) * METERS_PER_DEG_LAT
    totalMeters += Math.sqrt(dx * dx + dy * dy)
  }

  return Math.round((totalMeters / 1000) * 10) / 10
}

/**
 * Main impact analytics engine.
 * Computes deterministic impact metrics for a simulation frame.
 */
export function computeImpactMetrics(
  time: number,
  fireRing: LngLat[],
  ignition: LngLat,
  scenario: ScenarioInput,
): ImpactMetrics {
  const infrastructure = evaluateInfrastructure(ignition, time, scenario)
  const roads = evaluateRoads(ignition, time, scenario)
  const neighborhoods = evaluateNeighborhoods(ignition, time, scenario)

  const exposedResidents = neighborhoods.reduce((sum, n) => sum + n.exposedResidents, 0)
  const highRiskResidents = neighborhoods.reduce((sum, n) => sum + n.highRiskResidents, 0)
  const buildingsAtRisk = neighborhoods.reduce((sum, n) => sum + n.buildingsAtRisk, 0)
  const buildingsSeverelyThreatened = neighborhoods.reduce((sum, n) => sum + n.buildingsSeverelyThreatened, 0)

  const roadsBlockedCount = roads.filter((r) => r.status === 'blocked').length
  const roadsAffectedCount = roads.filter((r) => r.status !== 'clear').length

  const perimeterKm = time === 0 ? 0.1 : calculatePerimeterKm(fireRing, ignition)

  // Typical spread rate in meters per minute
  const spreadRateMetersPerMin =
    time === 0 ? 0 : Math.round(fireRadiusAt(0, time, scenario) / Math.max(1, time))

  return {
    exposedResidents,
    highRiskResidents,
    buildingsAtRisk,
    buildingsSeverelyThreatened,
    roadsBlockedCount,
    roadsAffectedCount,
    roads,
    threatenedInfrastructure: infrastructure,
    neighborhoods,
    spreadRateMetersPerMin,
    perimeterKm,
  }
}
