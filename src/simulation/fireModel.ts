import type { Level, LngLat, ScenarioInput, Severity, WindDirection } from './simulationTypes'

const METERS_PER_DEG_LAT = 111_320

// Fire spreads roughly this many meters per minute under baseline
// (moderate/moderate/moderate) conditions, before directional & topographic bias.
const FIRE_BASE_RATE_M_PER_MIN = 7.0

const SEVERITY_MULTIPLIER: Record<Severity, number> = { low: 0.7, moderate: 1.0, severe: 1.4 }
const LEVEL_MULTIPLIER: Record<Level, number> = { low: 0.7, moderate: 1.0, high: 1.3 }
const WIND_SPEED_NORM: Record<Level, number> = { low: 0.35, moderate: 0.65, high: 1.0 }

// Compass bearing (0 = N, clockwise) for the direction wind blows TOWARD —
// i.e. the direction the fire is pushed.
const WIND_BEARING_DEG: Record<WindDirection, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** Standard math-angle (0 = +x/East, counterclockwise) for a compass bearing. */
export function bearingToMathAngle(bearingDeg: number) {
  return degToRad(90 - bearingDeg)
}

function normalizeAngle(angle: number) {
  let a = angle
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

function conditionMultiplier(scenario: ScenarioInput) {
  return SEVERITY_MULTIPLIER[scenario.severity] * LEVEL_MULTIPLIER[scenario.dryness]
}

/**
 * Directional slope factor based on Cedar Ridge topography.
 * Terrain ascends toward the Northeast (Ridgeline at ~580m) and descends
 * toward Hollow Creek / Creekside in the Southwest (~250m).
 * Fire climbs uphill significantly faster (preheating fuel) and slows downhill.
 * 100% deterministic (no Math.random()).
 */
function slopeFactor(theta: number): number {
  // Uphill bearing ~ 40 deg (NE), math angle ~ 50 deg (~0.873 rad)
  const uphillAngle = bearingToMathAngle(40)
  const mainSlope = Math.cos(theta - uphillAngle) * 0.18
  // Secondary ridgeline / gully harmonic
  const secondaryRidge = Math.cos(2 * theta - 1.2) * 0.04
  const s = mainSlope + secondaryRidge
  return Math.max(0.72, Math.min(1.4, 1.0 + 1.3 * s))
}

/**
 * Fuel availability factor based on Cedar Ridge vegetation zones:
 * - Northeast & North: dense forest (Ridgeline forest edge) -> high fuel
 * - Southwest: riparian brushland (Hollow Creek brush) -> moderate/high fuel
 * - West & Southwest: Town Center / Lower Village -> urban barriers / slower spread
 * 100% deterministic (no Math.random()).
 */
function fuelFactor(theta: number): number {
  const forestAlignment = Math.max(0, Math.cos(theta - bearingToMathAngle(45))) // peaks NE
  const brushAlignment = Math.max(0, Math.cos(theta - bearingToMathAngle(210))) // peaks SSW
  const urbanAlignment = Math.max(0, Math.cos(theta - bearingToMathAngle(260))) // peaks W
  return 1.0 + 0.2 * forestAlignment + 0.12 * brushAlignment - 0.14 * urbanAlignment
}

/**
 * Deterministic organic perturbation (harmonics).
 * Replaces the artificial radial oval ("ακτινωτό") with natural tongues, lobes,
 * and indentations. Uses non-harmonic (Fibonacci-spaced) frequencies to ensure
 * natural irregularity without repetition.
 * 100% deterministic (no Math.random()).
 */
function organicFirePerturbation(theta: number, windAngle: number): number {
  const deltaWind = normalizeAngle(theta - windAngle)
  const downwindAlignment = Math.max(0, Math.cos(deltaWind)) // 1 at head fire, 0 at flank/rear

  // Multi-frequency harmonic lobes (frequencies: 3, 5, 8, 13)
  const h1 = 0.11 * Math.cos(3 * theta + 1.1)
  const h2 = 0.07 * Math.sin(5 * theta + 2.4)
  const h3 = 0.04 * Math.cos(8 * theta + 0.7)
  const h4 = 0.02 * Math.sin(13 * theta + 3.8)
  const baseHarmonics = h1 + h2 + h3 + h4

  // Head fire (downwind) develops pronounced tongues of fire due to spotting
  // and convective drafting; flank and backing fire remain tighter.
  const downwindTongueBoost = 0.7 + 0.6 * downwindAlignment

  return 1.0 + baseHarmonics * downwindTongueBoost
}

/**
 * Physics-inspired wildfire perimeter elongation.
 * Rather than a simple cosine offset, real wind-driven wildfires form an elongated
 * ellipse with length-to-width ratio (L/W) scaling with wind speed.
 */
function windFireSpreadFactor(theta: number, windBearingDeg: number, windSpeedNorm: number): number {
  const windAngle = bearingToMathAngle(windBearingDeg)
  const delta = normalizeAngle(theta - windAngle)

  // Length-to-width ratio: 1.25 at low wind, up to ~2.0 at high wind
  const lengthToWidth = 1.2 + 0.8 * windSpeedNorm
  // Ellipse eccentricity e = sqrt(1 - 1/(L/W)^2)
  const eccentricity = Math.min(0.72, Math.sqrt(Math.max(0, 1 - 1 / (lengthToWidth * lengthToWidth))))

  // Polar ellipse with rear focus at ignition:
  // r(delta) = R_head * (1 - e) / (1 - e * cos(delta))
  const ellipseFactor = (1 - eccentricity) / (1 - eccentricity * Math.cos(delta))

  // Blend with forward head thrust
  const headThrust = 1.0 + 1.2 * windSpeedNorm * Math.max(0, Math.cos(delta))

  return ellipseFactor * headThrust
}

/** Fire perimeter radius (meters) in direction theta, at time t (minutes). */
export function fireRadiusAt(theta: number, t: number, scenario: ScenarioInput): number {
  const windSpeedNorm = WIND_SPEED_NORM[scenario.windSpeed]
  const windBearing = WIND_BEARING_DEG[scenario.windDirection]
  const windAngle = bearingToMathAngle(windBearing)

  const windFactor = windFireSpreadFactor(theta, windBearing, windSpeedNorm)
  const slope = slopeFactor(theta)
  const fuel = fuelFactor(theta)
  const organic = organicFirePerturbation(theta, windAngle)

  // Total rate of spread in meters per minute in direction theta
  const rateOfSpread = FIRE_BASE_RATE_M_PER_MIN * conditionMultiplier(scenario) * windFactor * slope * fuel * organic

  return Math.max(2, rateOfSpread * t)
}

/**
 * Distinct smoke plume model:
 * 1. Driven primarily by wind advection (drifts downwind much further than ground fire spreads).
 * 2. Plume widens downwind into a broadening dispersion envelope.
 * 3. Irregular billowing lobes from atmospheric turbulence.
 * 4. ALWAYS strictly extends past the fire perimeter (r_smoke >= r_fire * 1.18 + 15m).
 */
export function smokeRadiusAt(theta: number, t: number, scenario: ScenarioInput): number {
  const fireRadius = fireRadiusAt(theta, t, scenario)
  const windSpeedNorm = WIND_SPEED_NORM[scenario.windSpeed]
  const windBearing = WIND_BEARING_DEG[scenario.windDirection]
  const windAngle = bearingToMathAngle(windBearing)
  const deltaWind = normalizeAngle(theta - windAngle)
  const cosAlignment = Math.cos(deltaWind)

  // Atmospheric billowing turbulent lobes (softer, larger billows than fire tongues)
  const billow1 = 0.12 * Math.cos(2 * theta + 2.1)
  const billow2 = 0.08 * Math.sin(4 * theta + 0.8)
  const billow3 = 0.04 * Math.cos(7 * theta + 3.7)
  const billowing = 1.0 + (billow1 + billow2 + billow3) * (0.6 + 0.6 * Math.max(0, cosAlignment))

  // Downwind plume reach multiplier: 1.7x at low wind, up to 2.5x at high wind relative to head fire
  const downwindPlumeReach = 1.7 + 0.8 * windSpeedNorm
  // Parabolic plume widening downwind
  const plumeCone = Math.pow(Math.max(0, (cosAlignment + 0.3) / 1.3), 1.1)
  const advectedReach = fireRadius * (1.18 + downwindPlumeReach * plumeCone) * billowing

  // Guaranteed boundary: smoke ALWAYS engulfs and exceeds the fire front
  const minSmokeRadius = fireRadius * 1.18 + 15

  return Math.max(minSmokeRadius, advectedReach)
}

/** Builds a closed polygon ring around a center point from a per-angle radius function (meters). */
export function buildRing(center: LngLat, radiusForAngle: (theta: number) => number, steps = 120): LngLat[] {
  const [lng0, lat0] = center
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos(degToRad(lat0))
  const points: LngLat[] = []
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2
    const r = Math.max(1, radiusForAngle(theta))
    const dLat = (r * Math.sin(theta)) / METERS_PER_DEG_LAT
    const dLng = (r * Math.cos(theta)) / metersPerDegLng
    points.push([lng0 + dLng, lat0 + dLat])
  }
  return points
}

/** Shoelace formula, approximating ring area in hectares (fine at this scale). */
export function ringAreaHectares(ring: LngLat[], center: LngLat): number {
  const [, lat0] = center
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos(degToRad(lat0))
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i]
    const [lng2, lat2] = ring[i + 1]
    const x1 = lng1 * metersPerDegLng
    const y1 = lat1 * METERS_PER_DEG_LAT
    const x2 = lng2 * metersPerDegLng
    const y2 = lat2 * METERS_PER_DEG_LAT
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area / 2) / 10_000
}
