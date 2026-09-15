export type LngLat = [number, number]

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type Level = 'low' | 'moderate' | 'high'
export type Severity = 'low' | 'moderate' | 'severe'

export type ScenarioInput = {
  windDirection: WindDirection
  windSpeed: Level
  dryness: Level
  severity: Severity
}

export type InfrastructureThreat = {
  id: string
  name: string
  type: 'hospital' | 'school' | 'fireStation' | 'shelter' | 'power'
  position: LngLat
  distanceToFireMeters: number
  status: 'safe' | 'alert' | 'threatened' | 'compromised'
}

export type RoadImpact = {
  id: string
  name: string
  capacity: number
  distanceToFireMeters: number
  status: 'clear' | 'smoke_hazard' | 'threatened' | 'blocked'
}

export type NeighborhoodImpact = {
  id: string
  name: string
  totalPopulation: number
  totalBuildings: number
  exposedResidents: number
  highRiskResidents: number
  buildingsAtRisk: number
  buildingsSeverelyThreatened: number
  status: 'clear' | 'advisory' | 'warning' | 'evacuate'
}

export type ImpactMetrics = {
  exposedResidents: number
  highRiskResidents: number
  buildingsAtRisk: number
  buildingsSeverelyThreatened: number
  roadsBlockedCount: number
  roadsAffectedCount: number
  roads: RoadImpact[]
  threatenedInfrastructure: InfrastructureThreat[]
  neighborhoods: NeighborhoodImpact[]
  spreadRateMetersPerMin: number
  perimeterKm: number
}

export type SimulationFrame = {
  /** Minutes since ignition. */
  time: number
  /** Cumulative fire perimeter at this time — closed ring, [lng, lat] pairs. */
  fireRing: LngLat[]
  /** Previous frame's fire ring, used to render the active burning edge as a band. Null on the first frame. */
  previousFireRing: LngLat[] | null
  /** Smoke plume reach at this time — closed ring, [lng, lat] pairs. */
  smokeRing: LngLat[]
  /** Approximate burned area in hectares, for later KPI display. */
  areaHectares: number
  /** Deterministic impact analytics for this frame */
  impact: ImpactMetrics
}

