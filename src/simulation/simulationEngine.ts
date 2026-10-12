import { advanceEvacuation } from './evacuationModel'
import { buildRing, fireRadiusAt, ringAreaHectares, smokeRadiusAt } from './fireModel'
import { computeImpactMetrics } from './impactModel'
import { computeTrafficMetrics } from './trafficModel'
import type { ImpactMetrics, LngLat, NetworkTrafficMetrics, ScenarioInput, SimulationFrame } from './simulationTypes'

export function runSimulation(ignition: LngLat, scenario: ScenarioInput, timePoints: number[]): SimulationFrame[] {
  const frames: SimulationFrame[] = []
  let previousFireRing: LngLat[] | null = null
  let evacuatedByNeighborhood: Record<string, number> = {}
  let previousTime: number | null = null
  let departureConditions: { impact: ImpactMetrics; traffic: NetworkTrafficMetrics } | null = null

  for (const t of timePoints) {
    const fireRing = t === 0 ? buildRing(ignition, () => 6) : buildRing(ignition, (theta) => fireRadiusAt(theta, t, scenario))
    const smokeRing = t === 0 ? buildRing(ignition, () => 40) : buildRing(ignition, (theta) => smokeRadiusAt(theta, t, scenario))

    const impact = computeImpactMetrics(t, fireRing, ignition, scenario)
    const traffic = computeTrafficMetrics(t, impact, scenario)
    const stepped = advanceEvacuation(
      t,
      previousTime ?? t,
      impact,
      traffic,
      scenario,
      evacuatedByNeighborhood,
      departureConditions,
    )
    evacuatedByNeighborhood = stepped.evacuatedByNeighborhood
    departureConditions = { impact, traffic }

    frames.push({
      time: t,
      fireRing,
      previousFireRing,
      smokeRing,
      areaHectares: ringAreaHectares(fireRing, ignition),
      impact,
      traffic,
      evacuation: stepped.metrics,
    })

    previousFireRing = fireRing
    previousTime = t
  }

  return frames
}
