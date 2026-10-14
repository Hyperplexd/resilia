import { findEmergencyUnit } from '../data/emergencyUnits'
import type { DeploymentOrder, ResponseTargetKind } from './responseModel'
import { LEVELS, SEVERITIES, TIME_POINTS, WIND_DIRECTIONS } from './scenarios'
import type { LngLat, ScenarioInput } from './simulationTypes'

const STORAGE_KEY = 'resilia.savedScenarios'
const MAX_SAVED = 20

const TARGET_KINDS: ResponseTargetKind[] = [
  'fire_front',
  'neighborhood',
  'hospital',
  'evacuation_zone',
  'choke_point',
]

export type SavedScenarioMetrics = {
  exposedResidents: number
  buildingsAtRisk: number
  clearanceMinutes: number
  evacuatedPercent: number
  areaHectares: number
  deployedCount: number
  onSceneCount: number
}

export type SavedScenario = {
  id: string
  name: string
  savedAt: string
  ignitionAddressId: string | null
  ignitionLabel: string
  ignition: LngLat
  parameters: ScenarioInput
  /** Minutes since ignition, on a timeline node. */
  minute: number
  nodeIndex: number
  orders: DeploymentOrder[]
  metrics: SavedScenarioMetrics
  /** Inputs that reproduce this run. Frames are recomputed on open. */
  resultRef: string
}

export function scenarioRunKey(parameters: ScenarioInput, ignition: LngLat): string {
  return `${parameters.windDirection}|${parameters.windSpeed}|${parameters.dryness}|${parameters.severity}|${ignition[0]}|${ignition[1]}`
}

export function buildResultRef(input: {
  parameters: ScenarioInput
  ignition: LngLat
  minute: number
  orders: Pick<DeploymentOrder, 'unitId' | 'targetId' | 'dispatchedAtMinute'>[]
}): string {
  const orders = [...input.orders]
    .sort((a, b) => a.unitId.localeCompare(b.unitId))
    .map((order) => `${order.unitId}@${order.targetId}@${order.dispatchedAtMinute}`)
    .join(',')
  const { parameters, ignition, minute } = input
  return `${scenarioRunKey(parameters, ignition)}|t${minute}|${orders || 'staged'}`
}

export function suggestScenarioName(parameters: ScenarioInput, ignitionLabel: string, minute: number): string {
  const where = ignitionLabel.replace(/^Ignition — /, '')
  return `${parameters.windDirection} wind · ${parameters.severity} · ${where} · T+${String(minute).padStart(2, '0')}`
}

export function assignmentSummary(order: DeploymentOrder): string {
  const callsign = findEmergencyUnit(order.unitId)?.callsign ?? order.unitId
  return `${callsign} → ${order.targetLabel}`
}

export function loadSavedScenarios(): SavedScenario[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      const saved = parseSavedScenario(item)
      return saved ? [saved] : []
    })
  } catch {
    return []
  }
}

export function rememberScenario(scenario: SavedScenario): SavedScenario[] {
  const next = [scenario, ...loadSavedScenarios().filter((item) => item.id !== scenario.id)].slice(0, MAX_SAVED)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function forgetScenario(id: string): SavedScenario[] {
  const next = loadSavedScenarios().filter((item) => item.id !== id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function createSavedScenario(input: {
  name: string
  ignitionAddressId: string | null
  ignitionLabel: string
  ignition: LngLat
  parameters: ScenarioInput
  nodeIndex: number
  orders: DeploymentOrder[]
  metrics: SavedScenarioMetrics
}): SavedScenario {
  const nodeIndex = clampNode(input.nodeIndex)
  const minute = TIME_POINTS[nodeIndex] ?? 0
  const orders = input.orders.map((order) => ({ ...order, route: order.route.map((point) => [...point] as LngLat), destination: [...order.destination] as LngLat }))
  return {
    id: crypto.randomUUID(),
    name: input.name.trim().slice(0, 80),
    savedAt: new Date().toISOString(),
    ignitionAddressId: input.ignitionAddressId,
    ignitionLabel: input.ignitionLabel,
    ignition: [...input.ignition] as LngLat,
    parameters: { ...input.parameters },
    minute,
    nodeIndex,
    orders,
    metrics: { ...input.metrics },
    resultRef: buildResultRef({
      parameters: input.parameters,
      ignition: input.ignition,
      minute,
      orders,
    }),
  }
}

function clampNode(index: number): number {
  if (!Number.isFinite(index)) return 0
  return Math.max(0, Math.min(TIME_POINTS.length - 1, Math.round(index)))
}

function parseSavedScenario(value: unknown): SavedScenario | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.savedAt !== 'string') return null
  if (typeof item.ignitionLabel !== 'string') return null
  const ignition = asLngLat(item.ignition)
  const parameters = asParameters(item.parameters)
  const metrics = asMetrics(item.metrics)
  if (!ignition || !parameters || !metrics) return null
  const nodeIndex = clampNode(typeof item.nodeIndex === 'number' ? item.nodeIndex : TIME_POINTS.indexOf(Number(item.minute)))
  const orders = Array.isArray(item.orders) ? item.orders.flatMap((order) => {
    const parsed = asOrder(order)
    return parsed ? [parsed] : []
  }) : []
  const minute = TIME_POINTS[nodeIndex] ?? 0
  const ignitionAddressId = typeof item.ignitionAddressId === 'string' ? item.ignitionAddressId : null
  return {
    id: item.id,
    name: item.name.slice(0, 80),
    savedAt: item.savedAt,
    ignitionAddressId,
    ignitionLabel: item.ignitionLabel,
    ignition,
    parameters,
    minute,
    nodeIndex,
    orders,
    metrics,
    resultRef: buildResultRef({ parameters, ignition, minute, orders }),
  }
}

function asParameters(value: unknown): ScenarioInput | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (!isOneOf(item.windDirection, WIND_DIRECTIONS)) return null
  if (!isOneOf(item.windSpeed, LEVELS)) return null
  if (!isOneOf(item.dryness, LEVELS)) return null
  if (!isOneOf(item.severity, SEVERITIES)) return null
  return {
    windDirection: item.windDirection,
    windSpeed: item.windSpeed,
    dryness: item.dryness,
    severity: item.severity,
  }
}

function asMetrics(value: unknown): SavedScenarioMetrics | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  const exposedResidents = asCount(item.exposedResidents)
  const buildingsAtRisk = asCount(item.buildingsAtRisk)
  const clearanceMinutes = asCount(item.clearanceMinutes)
  const evacuatedPercent = asCount(item.evacuatedPercent)
  const areaHectares = typeof item.areaHectares === 'number' && Number.isFinite(item.areaHectares) ? item.areaHectares : null
  const deployedCount = asCount(item.deployedCount)
  const onSceneCount = asCount(item.onSceneCount)
  if (
    exposedResidents === null
    || buildingsAtRisk === null
    || clearanceMinutes === null
    || evacuatedPercent === null
    || areaHectares === null
    || deployedCount === null
    || onSceneCount === null
  ) return null
  return {
    exposedResidents,
    buildingsAtRisk,
    clearanceMinutes,
    evacuatedPercent,
    areaHectares,
    deployedCount,
    onSceneCount,
  }
}

function asOrder(value: unknown): DeploymentOrder | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.unitId !== 'string' || !findEmergencyUnit(item.unitId)) return null
  if (typeof item.targetId !== 'string' || typeof item.targetLabel !== 'string') return null
  if (!isOneOf(item.targetKind, TARGET_KINDS)) return null
  const destination = asLngLat(item.destination)
  if (!destination) return null
  if (!Array.isArray(item.route) || item.route.length < 2 || item.route.length > 400) return null
  const route: LngLat[] = []
  for (const point of item.route) {
    const parsed = asLngLat(point)
    if (!parsed) return null
    route.push(parsed)
  }
  if (!Array.isArray(item.legSeconds) || item.legSeconds.some((n) => typeof n !== 'number' || !Number.isFinite(n))) return null
  if (typeof item.totalSeconds !== 'number' || !Number.isFinite(item.totalSeconds)) return null
  if (typeof item.forced !== 'boolean') return null
  if (typeof item.distanceMeters !== 'number' || !Number.isFinite(item.distanceMeters)) return null
  if (typeof item.dispatchedAtMinute !== 'number' || !Number.isFinite(item.dispatchedAtMinute)) return null
  return {
    unitId: item.unitId,
    targetId: item.targetId,
    targetKind: item.targetKind,
    targetLabel: item.targetLabel,
    destination,
    dispatchedAtMinute: item.dispatchedAtMinute,
    route,
    legSeconds: item.legSeconds.map((n) => Number(n)),
    totalSeconds: item.totalSeconds,
    forced: item.forced,
    distanceMeters: item.distanceMeters,
  }
}

function asLngLat(value: unknown): LngLat | null {
  if (!Array.isArray(value) || value.length !== 2) return null
  const [lng, lat] = value
  if (typeof lng !== 'number' || typeof lat !== 'number') return null
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  return [lng, lat]
}

function asCount(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T)
}

export function formatSavedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
