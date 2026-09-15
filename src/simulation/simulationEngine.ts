import { buildRing, fireRadiusAt, ringAreaHectares, smokeRadiusAt } from './fireModel'
import { computeImpactMetrics } from './impactModel'
import type { LngLat, ScenarioInput, SimulationFrame } from './simulationTypes'

export function runSimulation(ignition: LngLat, scenario: ScenarioInput, timePoints: number[]): SimulationFrame[] {
  const frames: SimulationFrame[] = []
  let previousFireRing: LngLat[] | null = null

  for (const t of timePoints) {
    const fireRing = t === 0 ? buildRing(ignition, () => 6) : buildRing(ignition, (theta) => fireRadiusAt(theta, t, scenario))
    const smokeRing = t === 0 ? buildRing(ignition, () => 40) : buildRing(ignition, (theta) => smokeRadiusAt(theta, t, scenario))

    const impact = computeImpactMetrics(t, fireRing, ignition, scenario)

    frames.push({
      time: t,
      fireRing,
      previousFireRing,
      smokeRing,
      areaHectares: ringAreaHectares(fireRing, ignition),
      impact,
    })

    previousFireRing = fireRing
  }

  return frames
}
