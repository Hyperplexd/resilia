import { findAddress } from '../data/demoAddresses'
import { projectResponse, type DeploymentOrder } from './responseModel'
import type { SavedScenario } from './savedScenarios'
import type { LngLat, SimulationFrame } from './simulationTypes'

export type CompareSnapshot = {
  areaHectares: number
  exposedResidents: number
  buildingsAtRisk: number
  clearanceMinutes: number
  blockedRoads: number
  bottlenecks: number
  deployedUnits: number
  criticalFacilities: number
}

export type CompareRowKey = keyof CompareSnapshot

export type CompareRow = {
  key: CompareRowKey
  label: string
  phrase: string
  format: (value: number) => string
  /** A larger number is a worse outcome, so the delta is colored that way. */
  higherIsWorse: boolean
}

export const COMPARE_ROWS: CompareRow[] = [
  { key: 'areaHectares', label: 'Affected area', phrase: 'burned area', format: (value) => `${value.toFixed(1)} ha`, higherIsWorse: true },
  { key: 'exposedResidents', label: 'Exposed residents', phrase: 'exposed residents', format: (value) => value.toLocaleString(), higherIsWorse: true },
  { key: 'buildingsAtRisk', label: 'Buildings at risk', phrase: 'buildings at risk', format: (value) => value.toLocaleString(), higherIsWorse: true },
  {
    key: 'clearanceMinutes',
    label: 'Clearance time',
    phrase: 'clearance time',
    format: (value) => `${value}${value >= 180 ? '+' : ''} min`,
    higherIsWorse: true,
  },
  { key: 'blockedRoads', label: 'Blocked roads', phrase: 'blocked roads', format: (value) => String(value), higherIsWorse: true },
  { key: 'bottlenecks', label: 'Bottlenecks', phrase: 'bottlenecks', format: (value) => String(value), higherIsWorse: true },
  { key: 'deployedUnits', label: 'Units deployed', phrase: 'units deployed', format: (value) => String(value), higherIsWorse: false },
  { key: 'criticalFacilities', label: 'Critical facilities', phrase: 'critical facilities', format: (value) => String(value), higherIsWorse: true },
]

export function ignitionForSaved(saved: SavedScenario): LngLat {
  if (saved.ignitionAddressId) {
    const found = findAddress(saved.ignitionAddressId)
    if (found) return [found.lng, found.lat]
  }
  return saved.ignition
}

export function snapshotAt(frame: SimulationFrame, orders: DeploymentOrder[]): CompareSnapshot {
  const response = projectResponse(orders, frame.time)
  return {
    areaHectares: frame.areaHectares,
    exposedResidents: frame.impact.exposedResidents,
    buildingsAtRisk: frame.impact.buildingsAtRisk,
    clearanceMinutes: frame.evacuation.clearanceMinutes,
    blockedRoads: frame.impact.roadsBlockedCount,
    bottlenecks: frame.traffic.chokePointsCount,
    deployedUnits: response.deployedCount + response.onSceneCount,
    criticalFacilities: frame.impact.threatenedInfrastructure.filter((item) => item.status !== 'safe').length,
  }
}

export function responseAt(frame: SimulationFrame, orders: DeploymentOrder[]) {
  return projectResponse(orders, frame.time)
}

export type DeltaTone = 'worse' | 'better' | 'flat' | 'neutral'

export function deltaLabel(baseline: number, next: number): string {
  const diff = next - baseline
  if (diff === 0) return '0'
  const arrow = diff > 0 ? '▲' : '▼'
  if (baseline === 0) return `${arrow} ${Math.abs(diff).toLocaleString()}`
  return `${arrow} ${Math.round(Math.abs(diff / baseline) * 100)}%`
}

export function deltaTone(baseline: number, next: number, higherIsWorse: boolean): DeltaTone {
  const diff = next - baseline
  if (diff === 0) return 'flat'
  if (!higherIsWorse) return 'neutral'
  return diff > 0 ? 'worse' : 'better'
}

export function compareLead(nameA: string, nameB: string, minute: number, a: CompareSnapshot, b: CompareSnapshot): string {
  const clock = `T+${String(minute).padStart(2, '0')}`
  const ranked = COMPARE_ROWS
    .filter((row) => row.higherIsWorse)
    .map((row) => {
      const left = a[row.key]
      const right = b[row.key]
      const diff = right - left
      const score = left !== 0 ? Math.abs(diff / left) : Math.abs(diff)
      return { row, left, right, diff, score }
    })
    .filter((item) => item.diff !== 0)
    .sort((x, y) => y.score - x.score)

  if (ranked.length === 0) return `At ${clock} these two runs show the same impact.`

  const top = ranked[0]
  const worseName = top.diff > 0 ? nameB : nameA
  const otherName = top.diff > 0 ? nameA : nameB
  const worseValue = top.diff > 0 ? top.right : top.left
  const otherValue = top.diff > 0 ? top.left : top.right
  if (otherValue === 0) {
    return `At ${clock}, only ${worseName} has ${top.row.phrase} (${top.row.format(worseValue)}).`
  }
  const pct = Math.round(Math.abs(top.diff / otherValue) * 100)
  return `At ${clock}, ${worseName} has ${pct}% more ${top.row.phrase} than ${otherName}.`
}
