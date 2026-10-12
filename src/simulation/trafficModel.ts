import { ROADS } from '../data/demoCity'
import type {
  CongestionLevel,
  ImpactMetrics,
  NetworkTrafficMetrics,
  RoadTrafficState,
  ScenarioInput,
} from './simulationTypes'

const BASELINE_VEHICLES: Record<string, number> = {
  'central-ave': 24,
  'mountain-road': 12,
  'pine-street': 8,
  'ridgeline-drive': 10,
  'hollow-creek-lane': 7,
}

// Deterministic surge schedule per road at timepoints T+00 through T+30
const TIME_SURGE_CURVE: Record<string, number[]> = {
  // [T0, T5, T10, T15, T20, T25, T30]
  'central-ave': [0, 26, 48, 70, 88, 96, 92],
  'mountain-road': [0, 16, 34, 46, 50, 44, 35],
  'pine-street': [0, 5, 12, 19, 24, 25, 23],
  'ridgeline-drive': [0, 18, 30, 34, 22, 12, 0],
  'hollow-creek-lane': [0, 3, 8, 14, 18, 17, 15],
}

function getTimeIndex(time: number): number {
  const points = [0, 5, 10, 15, 20, 25, 30]
  const exactIdx = points.indexOf(time)
  if (exactIdx !== -1) return exactIdx
  // Linear interpolation bracket for arbitrary minutes
  for (let i = 0; i < points.length - 1; i++) {
    if (time >= points[i] && time <= points[i + 1]) {
      return i + (time - points[i]) / (points[i + 1] - points[i])
    }
  }
  return time > 30 ? points.length - 1 : 0
}

function getInterpolatedSurge(roadId: string, time: number): number {
  const curve = TIME_SURGE_CURVE[roadId] ?? [0, 0, 0, 0, 0, 0, 0]
  const idx = getTimeIndex(time)
  const lower = Math.floor(idx)
  const upper = Math.min(curve.length - 1, Math.ceil(idx))
  if (lower === upper) return curve[lower]
  const fraction = idx - lower
  return Math.round(curve[lower] * (1 - fraction) + curve[upper] * fraction)
}

/**
 * Computes deterministic traffic flow, congestion, and bottleneck analytics
 * for each road segment across Cedar Ridge.
 */
export function computeTrafficMetrics(
  time: number,
  impact: ImpactMetrics,
  scenario: ScenarioInput,
): NetworkTrafficMetrics {
  const severityMult =
    scenario.severity === 'severe' ? 1.25 : scenario.severity === 'low' ? 0.8 : 1.0

  const roadStatusMap = new Map(impact.roads.map((r) => [r.id, r.status]))

  const roadStates: RoadTrafficState[] = ROADS.map((road) => {
    const baseVehicles = BASELINE_VEHICLES[road.id] ?? 10
    const surge = Math.round(getInterpolatedSurge(road.id, time) * severityMult)
    const status = roadStatusMap.get(road.id) ?? 'clear'

    let effectiveCapacity = road.capacity
    let speedCap = 50

    if (status === 'blocked') {
      effectiveCapacity = 1
      speedCap = 0
    } else if (status === 'threatened') {
      effectiveCapacity = Math.max(10, Math.round(road.capacity * 0.45))
      speedCap = 16
    } else if (status === 'smoke_hazard') {
      effectiveCapacity = Math.max(15, Math.round(road.capacity * 0.7))
      speedCap = 28
    }

    let vehicleCount = baseVehicles + surge

    // If a road is fully blocked by fire, vehicles cannot traverse and get stopped or rerouted
    if (status === 'blocked') {
      // Residual stranded vehicles at blockade
      vehicleCount = time >= 25 ? (road.id === 'ridgeline-drive' ? 8 : 14) : Math.min(vehicleCount, 20)
    }

    const saturationRatio = Number((vehicleCount / Math.max(1, effectiveCapacity)).toFixed(2))

    let congestionLevel: CongestionLevel = 'free_flow'
    let speedKmh = 50

    if (status === 'blocked') {
      congestionLevel = 'closed'
      speedKmh = 0
    } else if (saturationRatio >= 1.35) {
      congestionLevel = 'standstill'
      speedKmh = Math.max(4, Math.min(speedCap, Math.round(12 / saturationRatio)))
    } else if (saturationRatio >= 0.92) {
      congestionLevel = 'heavy'
      speedKmh = Math.max(8, Math.min(speedCap, Math.round(38 * (1 - (saturationRatio - 0.7) * 0.75))))
    } else if (saturationRatio >= 0.52) {
      congestionLevel = 'moderate'
      speedKmh = Math.max(18, Math.min(speedCap, Math.round(48 * (1 - (saturationRatio - 0.4) * 0.45))))
    } else {
      congestionLevel = 'free_flow'
      speedKmh = Math.min(speedCap, 50)
    }

    const isChokePoint =
      (time > 0 && status === 'blocked') ||
      saturationRatio >= 1.05 ||
      (road.id === 'mountain-road' && saturationRatio >= 0.85 && time >= 10) ||
      (road.id === 'central-ave' && saturationRatio >= 0.95 && time >= 15)

    const flowDirection = status === 'blocked' ? 'blocked' : 'outbound'

    return {
      roadId: road.id,
      name: road.name,
      capacity: road.capacity,
      vehicleCount,
      saturationRatio,
      speedKmh,
      congestionLevel,
      isChokePoint,
      flowDirection,
    }
  })

  // Network aggregates
  let totalVehicles = 0
  let weightedSpeedSum = 0
  let chokePointsCount = 0

  roadStates.forEach((rs) => {
    totalVehicles += rs.vehicleCount
    weightedSpeedSum += rs.speedKmh * Math.max(1, rs.vehicleCount)
    if (rs.isChokePoint) chokePointsCount++
  })

  const networkAverageSpeedKmh =
    totalVehicles > 0 ? Math.round(weightedSpeedSum / totalVehicles) : 48

  // Evacuation throughput passing western terminal of Central Avenue (vehicles per minute)
  const centralAve = roadStates.find((r) => r.roadId === 'central-ave')
  let activeEvacuationThroughput = 4
  if (time > 0 && centralAve) {
    if (centralAve.congestionLevel === 'standstill') {
      activeEvacuationThroughput = 16
    } else if (centralAve.congestionLevel === 'heavy') {
      activeEvacuationThroughput = 34
    } else if (centralAve.congestionLevel === 'moderate') {
      activeEvacuationThroughput = 26
    } else {
      activeEvacuationThroughput = 12
    }
    if (time >= 20) activeEvacuationThroughput += 8
  }

  return {
    networkAverageSpeedKmh,
    totalVehiclesEnRoute: totalVehicles,
    chokePointsCount,
    activeEvacuationThroughput,
    roads: roadStates,
  }
}
