import type {
  EvacuationMetrics,
  ImpactMetrics,
  InfrastructureThreat,
  LngLat,
  NeighborhoodEvacuation,
  NeighborhoodImpact,
  NetworkTrafficMetrics,
  RoadImpact,
  RoadTrafficState,
  SafeZoneState,
  SimulationFrame,
} from './simulationTypes'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpRing(a: LngLat[], b: LngLat[], t: number): LngLat[] {
  const count = Math.min(a.length, b.length)
  const ring: LngLat[] = new Array(count)
  for (let i = 0; i < count; i++) {
    ring[i] = [lerp(a[i][0], b[i][0], t), lerp(a[i][1], b[i][1], t)]
  }
  return ring
}

function blendList<T>(from: T[], to: T[], t: number, blend: (a: T, b: T, u: number) => T): T[] {
  if (from.length !== to.length) return t < 0.5 ? from : to
  return from.map((item, i) => blend(item, to[i], t))
}

function blendRoad(from: RoadImpact, to: RoadImpact, t: number): RoadImpact {
  return {
    ...from,
    distanceToFireMeters: Math.round(lerp(from.distanceToFireMeters, to.distanceToFireMeters, t)),
    status: t < 0.5 ? from.status : to.status,
  }
}

function blendInfra(from: InfrastructureThreat, to: InfrastructureThreat, t: number): InfrastructureThreat {
  return {
    ...from,
    distanceToFireMeters: Math.round(lerp(from.distanceToFireMeters, to.distanceToFireMeters, t)),
    status: t < 0.5 ? from.status : to.status,
  }
}

function blendNeighborhood(from: NeighborhoodImpact, to: NeighborhoodImpact, t: number): NeighborhoodImpact {
  return {
    ...from,
    exposedResidents: Math.round(lerp(from.exposedResidents, to.exposedResidents, t)),
    highRiskResidents: Math.round(lerp(from.highRiskResidents, to.highRiskResidents, t)),
    buildingsAtRisk: Math.round(lerp(from.buildingsAtRisk, to.buildingsAtRisk, t)),
    buildingsSeverelyThreatened: Math.round(lerp(from.buildingsSeverelyThreatened, to.buildingsSeverelyThreatened, t)),
    status: t < 0.5 ? from.status : to.status,
  }
}

function blendImpact(from: ImpactMetrics, to: ImpactMetrics, t: number): ImpactMetrics {
  return {
    exposedResidents: Math.round(lerp(from.exposedResidents, to.exposedResidents, t)),
    highRiskResidents: Math.round(lerp(from.highRiskResidents, to.highRiskResidents, t)),
    buildingsAtRisk: Math.round(lerp(from.buildingsAtRisk, to.buildingsAtRisk, t)),
    buildingsSeverelyThreatened: Math.round(lerp(from.buildingsSeverelyThreatened, to.buildingsSeverelyThreatened, t)),
    roadsBlockedCount: Math.round(lerp(from.roadsBlockedCount, to.roadsBlockedCount, t)),
    roadsAffectedCount: Math.round(lerp(from.roadsAffectedCount, to.roadsAffectedCount, t)),
    spreadRateMetersPerMin: Math.round(lerp(from.spreadRateMetersPerMin, to.spreadRateMetersPerMin, t)),
    perimeterKm: lerp(from.perimeterKm, to.perimeterKm, t),
    roads: blendList(from.roads, to.roads, t, blendRoad),
    threatenedInfrastructure: blendList(from.threatenedInfrastructure, to.threatenedInfrastructure, t, blendInfra),
    neighborhoods: blendList(from.neighborhoods, to.neighborhoods, t, blendNeighborhood),
  }
}

function blendTrafficRoad(from: RoadTrafficState, to: RoadTrafficState, t: number): RoadTrafficState {
  return {
    ...from,
    vehicleCount: Math.round(lerp(from.vehicleCount, to.vehicleCount, t)),
    saturationRatio: lerp(from.saturationRatio, to.saturationRatio, t),
    speedKmh: Math.round(lerp(from.speedKmh, to.speedKmh, t)),
    congestionLevel: t < 0.5 ? from.congestionLevel : to.congestionLevel,
    isChokePoint: t < 0.5 ? from.isChokePoint : to.isChokePoint,
    flowDirection: t < 0.5 ? from.flowDirection : to.flowDirection,
  }
}

function blendEvacNeighborhood(from: NeighborhoodEvacuation, to: NeighborhoodEvacuation, t: number): NeighborhoodEvacuation {
  const snap = t < 0.5 ? from : to
  return {
    ...snap,
    evacuated: Math.round(lerp(from.evacuated, to.evacuated, t)),
    remaining: Math.round(lerp(from.remaining, to.remaining, t)),
    progress: lerp(from.progress, to.progress, t),
    clearanceMinutes: Math.round(lerp(from.clearanceMinutes, to.clearanceMinutes, t)),
  }
}

function blendSafeZone(from: SafeZoneState, to: SafeZoneState, t: number): SafeZoneState {
  const snap = t < 0.5 ? from : to
  return {
    ...snap,
    assignedNeighborhoods: Math.round(lerp(from.assignedNeighborhoods, to.assignedNeighborhoods, t)),
    activeInflow: Math.round(lerp(from.activeInflow, to.activeInflow, t)),
  }
}

function blendEvacuation(from: EvacuationMetrics, to: EvacuationMetrics, t: number): EvacuationMetrics {
  const snap = t < 0.5 ? from : to
  return {
    clearanceMinutes: Math.round(lerp(from.clearanceMinutes, to.clearanceMinutes, t)),
    evacuatedResidents: Math.round(lerp(from.evacuatedResidents, to.evacuatedResidents, t)),
    remainingResidents: Math.round(lerp(from.remainingResidents, to.remainingResidents, t)),
    strandedResidents: Math.round(lerp(from.strandedResidents, to.strandedResidents, t)),
    progress: lerp(from.progress, to.progress, t),
    activeOrders: Math.round(lerp(from.activeOrders, to.activeOrders, t)),
    neighborhoods: blendList(from.neighborhoods, to.neighborhoods, t, blendEvacNeighborhood),
    safeZones: blendList(from.safeZones, to.safeZones, t, blendSafeZone),
    safeCorridorRoadIds: snap.safeCorridorRoadIds,
  }
}

function blendTraffic(from: NetworkTrafficMetrics, to: NetworkTrafficMetrics, t: number): NetworkTrafficMetrics {
  return {
    networkAverageSpeedKmh: Math.round(lerp(from.networkAverageSpeedKmh, to.networkAverageSpeedKmh, t)),
    totalVehiclesEnRoute: Math.round(lerp(from.totalVehiclesEnRoute, to.totalVehiclesEnRoute, t)),
    chokePointsCount: Math.round(lerp(from.chokePointsCount, to.chokePointsCount, t)),
    activeEvacuationThroughput: Math.round(lerp(from.activeEvacuationThroughput, to.activeEvacuationThroughput, t)),
    roads: blendList(from.roads, to.roads, t, blendTrafficRoad),
  }
}

function blendPrevious(from: SimulationFrame, to: SimulationFrame, t: number): LngLat[] | null {
  if (!from.previousFireRing) {
    if (!to.previousFireRing || t <= 0) return null
    return lerpRing(from.fireRing, to.previousFireRing, t)
  }
  if (!to.previousFireRing) return from.previousFireRing
  return lerpRing(from.previousFireRing, to.previousFireRing, t)
}

/** Frame at a fractional node index. Exact nodes return the precomputed frame. */
export function frameAt(frames: SimulationFrame[], progress: number): SimulationFrame {
  const last = frames.length - 1
  if (last <= 0) return frames[0]
  const clamped = Math.max(0, Math.min(progress, last))
  const index = Math.floor(clamped)
  const t = clamped - index
  if (index >= last || t === 0) return frames[Math.min(index, last)]

  const from = frames[index]
  const to = frames[index + 1]
  return {
    time: lerp(from.time, to.time, t),
    fireRing: lerpRing(from.fireRing, to.fireRing, t),
    previousFireRing: blendPrevious(from, to, t),
    smokeRing: lerpRing(from.smokeRing, to.smokeRing, t),
    areaHectares: lerp(from.areaHectares, to.areaHectares, t),
    impact: blendImpact(from.impact, to.impact, t),
    traffic: blendTraffic(from.traffic, to.traffic, t),
    evacuation: blendEvacuation(from.evacuation, to.evacuation, t),
  }
}
