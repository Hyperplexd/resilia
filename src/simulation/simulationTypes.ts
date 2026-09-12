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
}
