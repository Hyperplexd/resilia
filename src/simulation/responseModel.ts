import { EMERGENCY_UNITS, findEmergencyUnit, type EmergencyUnit, type EmergencyUnitType } from '../data/emergencyUnits'
import { NEIGHBORHOODS, ROADS, INFRASTRUCTURE, type LngLat } from '../data/demoCity'
import type { CongestionLevel, NetworkTrafficMetrics, SimulationFrame } from './simulationTypes'

const METERS_PER_DEG_LAT = 111_320
const JUNCTION_METERS = 18
const ACCESS_KMH = 30
const JUNCTION_KMH = 25

const RESPONSE_KMH: Record<CongestionLevel, number> = {
  free_flow: 58,
  moderate: 42,
  heavy: 26,
  standstill: 12,
  closed: 8,
}

export type ResponseTargetKind = 'fire_front' | 'neighborhood' | 'hospital' | 'evacuation_zone' | 'choke_point'

export type ResponseTarget = {
  id: string
  kind: ResponseTargetKind
  label: string
  position: LngLat
}

export type UnitStatus = 'staged' | 'deployed' | 'on_scene'

export type DeploymentOrder = {
  unitId: string
  targetId: string
  targetKind: ResponseTargetKind
  targetLabel: string
  destination: LngLat
  dispatchedAtMinute: number
  route: LngLat[]
  legSeconds: number[]
  totalSeconds: number
  forced: boolean
  distanceMeters: number
}

export type ResponseUnitView = {
  id: string
  callsign: string
  shortLabel: string
  type: EmergencyUnitType
  stationName: string
  color: string
  lineOffset: number
  status: UnitStatus
  position: LngLat
  assigned: boolean
  targetLabel: string | null
  targetKind: ResponseTargetKind | null
  departsAtMinute: number | null
  etaSeconds: number | null
  etaLabel: string | null
  route: LngLat[] | null
  forced: boolean
  criticalApproach: boolean
}

export type ResponseSnapshot = {
  units: ResponseUnitView[]
  stagedCount: number
  deployedCount: number
  onSceneCount: number
  approachingCritical: number
  soonestEtaSeconds: number | null
  soonestEtaLabel: string | null
}

type GraphEdge = {
  to: number
  meters: number
  roadId: string | null
}

type RoadNetwork = {
  positions: LngLat[]
  adj: GraphEdge[][]
  vertexId: Map<string, number>
}

type Snap = {
  roadId: string
  index: number
  t: number
  position: LngLat
  distanceMeters: number
}

let networkCache: RoadNetwork | null = null

function metersPerDegLng(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)
}

function metersBetween(a: LngLat, b: LngLat): number {
  const mLng = metersPerDegLng((a[1] + b[1]) / 2)
  return Math.hypot((b[0] - a[0]) * mLng, (b[1] - a[1]) * METERS_PER_DEG_LAT)
}

function secondsFor(meters: number, kmh: number): number {
  if (meters <= 0 || kmh <= 0) return 0
  return (meters / 1000 / kmh) * 3600
}

export function formatEta(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  const remain = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`
}

function projectSegment(point: LngLat, a: LngLat, b: LngLat): { t: number; position: LngLat; meters: number } {
  const mLng = metersPerDegLng((a[1] + b[1]) / 2)
  const ax = a[0] * mLng
  const ay = a[1] * METERS_PER_DEG_LAT
  const bx = b[0] * mLng
  const by = b[1] * METERS_PER_DEG_LAT
  const px = point[0] * mLng
  const py = point[1] * METERS_PER_DEG_LAT
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  const raw = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
  const t = Math.max(0, Math.min(1, raw))
  const position: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  const sx = ax + dx * t
  const sy = ay + dy * t
  return { t, position, meters: Math.hypot(px - sx, py - sy) }
}

function getNetwork(): RoadNetwork {
  if (networkCache) return networkCache

  const positions: LngLat[] = []
  const roadIds: string[] = []
  const vertexId = new Map<string, number>()
  for (const road of ROADS) {
    road.points.forEach((position, index) => {
      vertexId.set(`${road.id}:${index}`, positions.length)
      positions.push(position)
      roadIds.push(road.id)
    })
  }

  const adj: GraphEdge[][] = positions.map(() => [])
  const link = (from: number, to: number, meters: number, roadId: string | null) => {
    adj[from].push({ to, meters, roadId })
    adj[to].push({ to: from, meters, roadId })
  }

  for (const road of ROADS) {
    for (let i = 0; i < road.points.length - 1; i += 1) {
      const from = vertexId.get(`${road.id}:${i}`)
      const to = vertexId.get(`${road.id}:${i + 1}`)
      if (from === undefined || to === undefined) continue
      link(from, to, metersBetween(road.points[i], road.points[i + 1]), road.id)
    }
  }

  for (let i = 0; i < positions.length; i += 1) {
    for (let j = i + 1; j < positions.length; j += 1) {
      if (roadIds[i] === roadIds[j]) continue
      const meters = metersBetween(positions[i], positions[j])
      if (meters <= JUNCTION_METERS) link(i, j, Math.max(meters, 1), null)
    }
  }

  networkCache = { positions, adj, vertexId }
  return networkCache
}

function snapToNetwork(point: LngLat): Snap {
  let best: Snap | null = null
  for (const road of ROADS) {
    for (let i = 0; i < road.points.length - 1; i += 1) {
      const projected = projectSegment(point, road.points[i], road.points[i + 1])
      if (!best || projected.meters < best.distanceMeters) {
        best = {
          roadId: road.id,
          index: i,
          t: projected.t,
          position: projected.position,
          distanceMeters: projected.meters,
        }
      }
    }
  }
  if (!best) {
    const fallback = ROADS[0].points[0]
    return { roadId: ROADS[0].id, index: 0, t: 0, position: fallback, distanceMeters: metersBetween(point, fallback) }
  }
  return best
}

function midpoint(points: LngLat[]): LngLat {
  if (points.length === 0) return [0, 0]
  if (points.length === 1) return points[0]
  let total = 0
  const lengths: number[] = []
  for (let i = 1; i < points.length; i += 1) {
    const length = metersBetween(points[i - 1], points[i])
    lengths.push(length)
    total += length
  }
  const target = total / 2
  let walked = 0
  for (let i = 0; i < lengths.length; i += 1) {
    if (walked + lengths[i] >= target) {
      const t = lengths[i] === 0 ? 0 : (target - walked) / lengths[i]
      const a = points[i]
      const b = points[i + 1]
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    walked += lengths[i]
  }
  return points[points.length - 1]
}

function centroid(boundary: LngLat[]): LngLat {
  const ring = boundary.length > 1 && boundary[0][0] === boundary[boundary.length - 1][0] && boundary[0][1] === boundary[boundary.length - 1][1]
    ? boundary.slice(0, -1)
    : boundary
  const lng = ring.reduce((sum, point) => sum + point[0], 0) / ring.length
  const lat = ring.reduce((sum, point) => sum + point[1], 0) / ring.length
  return [lng, lat]
}

function nearestRoadPoint(point: LngLat): LngLat {
  return snapToNetwork(point).position
}

function fireFrontAccess(ring: LngLat[]): LngLat {
  let best = ring[0] ?? [0, 0]
  let bestDistance = Infinity
  for (const point of ring) {
    const snap = snapToNetwork(point)
    if (snap.distanceMeters < bestDistance) {
      bestDistance = snap.distanceMeters
      best = snap.position
    }
  }
  return best
}

export function listResponseTargets(frame: SimulationFrame): ResponseTarget[] {
  const hospital = INFRASTRUCTURE.find((item) => item.type === 'hospital')
  const targets: ResponseTarget[] = [
    {
      id: 'fire-front',
      kind: 'fire_front',
      label: 'Active fire front',
      position: fireFrontAccess(frame.fireRing),
    },
    ...NEIGHBORHOODS.map((neighborhood) => ({
      id: `neighborhood:${neighborhood.id}`,
      kind: 'neighborhood' as const,
      label: neighborhood.name,
      position: nearestRoadPoint(centroid(neighborhood.boundary)),
    })),
  ]

  if (hospital) {
    targets.push({
      id: `hospital:${hospital.id}`,
      kind: 'hospital',
      label: hospital.name,
      position: hospital.position,
    })
  }

  for (const zone of frame.evacuation.safeZones) {
    targets.push({
      id: `evac:${zone.id}`,
      kind: 'evacuation_zone',
      label: zone.name,
      position: zone.position,
    })
  }

  for (const road of frame.traffic.roads) {
    if (!road.isChokePoint) continue
    const geometry = ROADS.find((item) => item.id === road.roadId)
    if (!geometry) continue
    targets.push({
      id: `choke:${road.roadId}`,
      kind: 'choke_point',
      label: `${road.name} choke point`,
      position: midpoint(geometry.points),
    })
  }

  return targets
}

type PathDraft = {
  points: LngLat[]
  legSeconds: number[]
}

function pushPoint(path: PathDraft, next: LngLat, seconds: number) {
  const last = path.points[path.points.length - 1]
  if (last && metersBetween(last, next) < 5) {
    if (path.legSeconds.length > 0) path.legSeconds[path.legSeconds.length - 1] += seconds
    return
  }
  if (path.points.length > 0) path.legSeconds.push(Math.max(0, seconds))
  path.points.push(next)
}

function travelKmh(
  roadId: string | null,
  congestion: Map<string, CongestionLevel>,
  allowClosed: boolean,
): number | null {
  if (roadId == null) return JUNCTION_KMH
  const level = congestion.get(roadId) ?? 'free_flow'
  if (level === 'closed' && !allowClosed) return null
  return RESPONSE_KMH[level]
}

function routeOnNetwork(
  origin: LngLat,
  destination: LngLat,
  traffic: NetworkTrafficMetrics,
  allowClosed: boolean,
): PathDraft | null {
  const network = getNetwork()
  const from = snapToNetwork(origin)
  const to = snapToNetwork(destination)
  const baseCount = network.positions.length
  const originNode = baseCount
  const destNode = baseCount + 1
  const congestion = new Map(traffic.roads.map((road) => [road.roadId, road.congestionLevel]))

  const originEdges: GraphEdge[] = []
  const inbound = new Map<number, GraphEdge[]>()

  const connectSnap = (snap: Snap, virtual: 'origin' | 'dest') => {
    const road = ROADS.find((item) => item.id === snap.roadId)
    const startId = network.vertexId.get(`${snap.roadId}:${snap.index}`)
    const endId = network.vertexId.get(`${snap.roadId}:${snap.index + 1}`)
    if (!road || startId === undefined || endId === undefined) return
    const length = metersBetween(road.points[snap.index], road.points[snap.index + 1])
    const ends = [
      { id: startId, meters: length * snap.t },
      { id: endId, meters: length * (1 - snap.t) },
    ]
    for (const end of ends) {
      if (virtual === 'origin') originEdges.push({ to: end.id, meters: end.meters, roadId: snap.roadId })
      else {
        const list = inbound.get(end.id) ?? []
        list.push({ to: destNode, meters: end.meters, roadId: snap.roadId })
        inbound.set(end.id, list)
      }
    }
  }

  connectSnap(from, 'origin')
  connectSnap(to, 'dest')

  if (from.roadId === to.roadId && from.index === to.index) {
    const road = ROADS.find((item) => item.id === from.roadId)
    if (road) {
      const length = metersBetween(road.points[from.index], road.points[from.index + 1])
      originEdges.push({
        to: destNode,
        meters: length * Math.abs(from.t - to.t),
        roadId: from.roadId,
      })
    }
  }

  const nodeCount = baseCount + 2
  const dist = new Array<number>(nodeCount).fill(Infinity)
  const prev = new Array<number>(nodeCount).fill(-1)
  const enteredSeconds = new Array<number>(nodeCount).fill(0)
  const used = new Array<boolean>(nodeCount).fill(false)
  dist[originNode] = 0

  const edgesFrom = (node: number): GraphEdge[] => {
    if (node === originNode) return originEdges
    if (node === destNode) return []
    return network.adj[node].concat(inbound.get(node) ?? [])
  }

  for (let step = 0; step < nodeCount; step += 1) {
    let current = -1
    let best = Infinity
    for (let i = 0; i < nodeCount; i += 1) {
      if (!used[i] && dist[i] < best) {
        best = dist[i]
        current = i
      }
    }
    if (current < 0 || current === destNode) break
    used[current] = true
    for (const edge of edgesFrom(current)) {
      const kmh = travelKmh(edge.roadId, congestion, allowClosed)
      if (kmh == null) continue
      const next = dist[current] + secondsFor(edge.meters, kmh)
      if (next < dist[edge.to]) {
        dist[edge.to] = next
        prev[edge.to] = current
        enteredSeconds[edge.to] = secondsFor(edge.meters, kmh)
      }
    }
  }

  if (!Number.isFinite(dist[destNode])) return null

  const chain: number[] = []
  for (let node = destNode, guard = 0; node !== -1 && guard < nodeCount + 2; guard += 1) {
    chain.push(node)
    if (node === originNode) break
    node = prev[node]
  }
  if (chain[chain.length - 1] !== originNode) return null
  chain.reverse()

  const coord = network.positions.slice()
  coord[originNode] = from.position
  coord[destNode] = to.position

  const path: PathDraft = { points: [], legSeconds: [] }
  pushPoint(path, coord[chain[0]], 0)
  for (let i = 1; i < chain.length; i += 1) {
    pushPoint(path, coord[chain[i]], enteredSeconds[chain[i]])
  }
  return path
}

function pathDistance(points: LngLat[]): number {
  let meters = 0
  for (let i = 1; i < points.length; i += 1) meters += metersBetween(points[i - 1], points[i])
  return meters
}

function planRoute(origin: LngLat, destination: LngLat, traffic: NetworkTrafficMetrics): {
  points: LngLat[]
  legSeconds: number[]
  totalSeconds: number
  forced: boolean
  distanceMeters: number
} {
  let forced = false
  let road = routeOnNetwork(origin, destination, traffic, false)
  if (!road) {
    road = routeOnNetwork(origin, destination, traffic, true)
    forced = true
  }

  const path: PathDraft = { points: [], legSeconds: [] }
  if (!road) {
    pushPoint(path, origin, 0)
    pushPoint(path, destination, secondsFor(metersBetween(origin, destination), ACCESS_KMH))
    forced = true
  } else {
    pushPoint(path, origin, 0)
    pushPoint(path, road.points[0], secondsFor(metersBetween(origin, road.points[0]), ACCESS_KMH))
    for (let i = 1; i < road.points.length; i += 1) {
      pushPoint(path, road.points[i], road.legSeconds[i - 1] ?? 0)
    }
    const roadEnd = road.points[road.points.length - 1]
    pushPoint(path, destination, secondsFor(metersBetween(roadEnd, destination), ACCESS_KMH))
  }

  const totalSeconds = path.legSeconds.reduce((sum, seconds) => sum + seconds, 0)
  return {
    points: path.points,
    legSeconds: path.legSeconds,
    totalSeconds,
    forced,
    distanceMeters: pathDistance(path.points),
  }
}

export function pointAlong(points: LngLat[], legSeconds: number[], elapsedSeconds: number): LngLat {
  if (points.length === 0) return [0, 0]
  if (elapsedSeconds <= 0 || points.length === 1) return points[0]
  let walked = 0
  for (let i = 0; i < legSeconds.length; i += 1) {
    const leg = legSeconds[i]
    if (walked + leg >= elapsedSeconds) {
      const t = leg <= 0 ? 1 : (elapsedSeconds - walked) / leg
      const a = points[i]
      const b = points[i + 1] ?? a
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    walked += leg
  }
  return points[points.length - 1]
}

function isCriticalTarget(kind: ResponseTargetKind): boolean {
  return kind === 'fire_front' || kind === 'choke_point' || kind === 'hospital'
}

export function buildDeploymentOrder(
  unitId: string,
  target: ResponseTarget,
  traffic: NetworkTrafficMetrics,
  minute: number,
  origin?: LngLat,
): DeploymentOrder {
  const unit = findEmergencyUnit(unitId)
  if (!unit) throw new Error(`Unknown unit ${unitId}`)
  const start = origin ?? unit.home
  const planned = planRoute(start, target.position, traffic)
  return {
    unitId,
    targetId: target.id,
    targetKind: target.kind,
    targetLabel: target.label,
    destination: planned.points[planned.points.length - 1] ?? target.position,
    dispatchedAtMinute: minute,
    route: planned.points,
    legSeconds: planned.legSeconds,
    totalSeconds: planned.totalSeconds,
    forced: planned.forced,
    distanceMeters: planned.distanceMeters,
  }
}

function projectUnit(unit: EmergencyUnit, order: DeploymentOrder | null, minute: number): ResponseUnitView {
  const base = {
    id: unit.id,
    callsign: unit.callsign,
    shortLabel: unit.shortLabel,
    type: unit.type,
    stationName: unit.stationName,
    color: unit.color,
    lineOffset: unit.lineOffset,
  }

  if (!order || minute + 1e-4 < order.dispatchedAtMinute) {
    return {
      ...base,
      status: 'staged',
      position: unit.home,
      assigned: Boolean(order),
      targetLabel: order ? order.targetLabel : null,
      targetKind: order ? order.targetKind : null,
      departsAtMinute: order ? order.dispatchedAtMinute : null,
      etaSeconds: order ? order.totalSeconds : null,
      etaLabel: order ? formatEta(order.totalSeconds) : null,
      route: null,
      forced: order?.forced ?? false,
      criticalApproach: false,
    }
  }

  const elapsed = (minute - order.dispatchedAtMinute) * 60
  if (elapsed >= order.totalSeconds - 0.4) {
    return {
      ...base,
      status: 'on_scene',
      position: order.destination,
      assigned: true,
      targetLabel: order.targetLabel,
      targetKind: order.targetKind,
      departsAtMinute: order.dispatchedAtMinute,
      etaSeconds: 0,
      etaLabel: formatEta(0),
      route: order.route,
      forced: order.forced,
      criticalApproach: false,
    }
  }

  return {
    ...base,
    status: 'deployed',
    position: pointAlong(order.route, order.legSeconds, elapsed),
    assigned: true,
    targetLabel: order.targetLabel,
    targetKind: order.targetKind,
    departsAtMinute: order.dispatchedAtMinute,
    etaSeconds: Math.max(0, order.totalSeconds - elapsed),
    etaLabel: formatEta(order.totalSeconds - elapsed),
    route: order.route,
    forced: order.forced,
    criticalApproach: isCriticalTarget(order.targetKind),
  }
}

export function projectResponse(orders: DeploymentOrder[], minute: number): ResponseSnapshot {
  const units = EMERGENCY_UNITS.map((unit) => {
    const order = orders.find((item) => item.unitId === unit.id) ?? null
    return projectUnit(unit, order, minute)
  })
  const deployed = units.filter((unit) => unit.status === 'deployed')
  const soonest = deployed.reduce<number | null>((best, unit) => {
    if (unit.etaSeconds == null) return best
    return best == null ? unit.etaSeconds : Math.min(best, unit.etaSeconds)
  }, null)

  return {
    units,
    stagedCount: units.filter((unit) => unit.status === 'staged').length,
    deployedCount: deployed.length,
    onSceneCount: units.filter((unit) => unit.status === 'on_scene').length,
    approachingCritical: units.filter((unit) => unit.criticalApproach).length,
    soonestEtaSeconds: soonest,
    soonestEtaLabel: soonest == null ? null : formatEta(soonest),
  }
}
