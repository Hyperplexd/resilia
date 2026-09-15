import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMapCtor, NavigationControl, Marker, Popup } from 'maplibre-gl'
import type { Map as MapLibreMap, StyleSpecification, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  ROADS,
  VEGETATION_ZONES,
  NEIGHBORHOODS,
  INFRASTRUCTURE,
  IGNITION_POINT,
  type Infrastructure,
} from '../../data/demoCity'
import type { SimulationFrame } from '../../simulation/simulationTypes'
import './CityMap.css'

// OpenFreeMap: free MapLibre-compatible vector tiles, no API key, no
// rate limit. If VITE_MAPTILER_KEY is set, MapTiler's style is used instead
// — same building schema, different visual polish. Neither is required.
const STYLE_URL = import.meta.env.VITE_MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`
  : 'https://tiles.openfreemap.org/styles/liberty'

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label: string
}

type CityMapProps = {
  center: { lat: number; lng: number }
  zoom?: number
  pitch?: number
  markers?: MapMarker[]
  /** Renders the full digital-twin layers: roads, vegetation, neighborhoods, infrastructure, ignition point. */
  showTwin?: boolean
  /** Current simulation frame — when provided (with showTwin), renders fire + smoke polygons. */
  fireFrame?: SimulationFrame | null
}

const INFRA_LABEL: Record<Infrastructure['type'], string> = {
  hospital: 'H',
  school: 'Sc',
  fireStation: 'FS',
  shelter: 'Sh',
  power: 'Pw',
}

let cachedArchitecturalStyle: StyleSpecification | null = null

async function getArchitecturalStyle(): Promise<StyleSpecification | string> {
  if (import.meta.env.VITE_MAPTILER_KEY) return STYLE_URL
  if (cachedArchitecturalStyle) return cachedArchitecturalStyle
  try {
    const res = await fetch(STYLE_URL)
    const raw = (await res.json()) as StyleSpecification
    cachedArchitecturalStyle = transformToArchitecturalStyle(raw)
    return cachedArchitecturalStyle
  } catch (err) {
    console.warn('Could not fetch custom architectural style, using URL directly:', err)
    return STYLE_URL
  }
}

export default function CityMap({
  center,
  zoom = 14.5,
  pitch = 58,
  markers = [],
  showTwin = false,
  fireFrame = null,
}: CityMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRefs = useRef<Marker[]>([])
  const twinMarkerRefs = useRef<Marker[]>([])
  const infraMarkerMapRef = useRef<Map<string, Marker>>(new Map())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const container = containerRef.current
    const currentTwinMarkers = twinMarkerRefs.current
    let disposed = false

    getArchitecturalStyle().then((resolvedStyle) => {
      if (disposed || !container) return

      const map = new MapLibreMapCtor({
        container,
        style: resolvedStyle,
        center: [center.lng, center.lat],
        zoom,
        pitch,
        bearing: -14,
        maxPitch: 75,
      })

      map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')

      map.on('load', () => {
        if (disposed) return
        setupMapLightingAndShadows(map)
        if (showTwin) {
          addTwinLayers(map, twinMarkerRefs, infraMarkerMapRef)
          addFireLayers(map)
        }
        setReady(true)
      })

      mapRef.current = map
    })

    return () => {
      disposed = true
      currentTwinMarkers.forEach((m) => m.remove())
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // Twin layers and style are fixed at mount; only the focus point re-flies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({ center: [center.lng, center.lat], zoom, pitch, bearing: -14, essential: true })
  }, [center.lat, center.lng, zoom, pitch])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markerRefs.current.forEach((m) => m.remove())
    markerRefs.current = markers.map((m) => {
      const el = document.createElement('div')
      el.className = 'city-map__pin'
      return new Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .setPopup(new Popup({ offset: 18 }).setText(m.label))
        .addTo(map)
    })
  }, [markers])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !showTwin) return
    updateFireLayers(map, fireFrame, infraMarkerMapRef)
  }, [fireFrame, ready, showTwin])

  return (
    <div className="city-map">
      <div ref={containerRef} className="city-map__container" />
    </div>
  )
}

function transformToArchitecturalStyle(style: StyleSpecification): StyleSpecification {
  const cloned = JSON.parse(JSON.stringify(style)) as StyleSpecification

  // Warmer, brighter light — makes the porcelain buildings actually glow
  // against the dark ground, like a lit architectural model on a dark table
  cloned.light = {
    anchor: 'viewport',
    position: [1.5, 325, 62],
    color: '#f6f1e8',
    intensity: 0.6,
  }

  const sources = cloned.sources ?? {}
  const vectorSourceId =
    Object.keys(sources).find((key) => sources[key].type === 'vector') ?? 'openmaptiles'

  cloned.layers.forEach((l) => {
    // 1. Navy ground — lighter than pure charcoal, still reads as "console"
    if (l.type === 'background') {
      l.paint = { ...l.paint, 'background-color': '#101b2e' }
    }
    // 2. Muted teal-green for parks & vegetation — terrain, with a blue undertone
    else if (
      l.id.includes('park') ||
      l.id.includes('wood') ||
      l.id.includes('grass') ||
      l.id.includes('pitch') ||
      l.id.includes('wetland')
    ) {
      if (l.type === 'fill' && l.paint) {
        l.paint = { ...l.paint, 'fill-color': '#1d3a3c', 'fill-opacity': 0.85 }
      } else if (l.type === 'line' && l.paint) {
        l.paint = { ...l.paint, 'line-color': '#2b5254' }
      }
    }
    // 3. Residential landuse, soft steel-blue
    else if (l.id.includes('residential')) {
      if (l.type === 'fill' && l.paint) {
        l.paint = { ...l.paint, 'fill-color': '#182842', 'fill-opacity': 0.55 }
      }
    }
    // 4. Clear azure water
    else if (l.id.includes('water')) {
      if (l.type === 'fill' && l.paint) {
        l.paint = { ...l.paint, 'fill-color': '#1a4266', 'fill-opacity': 0.95 }
      } else if (l.type === 'line' && l.paint) {
        l.paint = { ...l.paint, 'line-color': '#2f6690' }
      }
    }
    // 5. Warm grey ribbons for roads, tunnels, bridges — matches the porcelain buildings
    else if (l.id.includes('road') || l.id.includes('bridge') || l.id.includes('tunnel')) {
      if (l.type === 'line' && l.paint && 'line-color' in l.paint) {
        if (l.id.includes('casing')) {
          l.paint = { ...l.paint, 'line-color': '#12141b' }
        } else if (l.id.includes('motorway') || l.id.includes('trunk') || l.id.includes('primary')) {
          l.paint = { ...l.paint, 'line-color': '#9791a0' }
        } else if (l.id.includes('secondary') || l.id.includes('tertiary')) {
          l.paint = { ...l.paint, 'line-color': '#7c7684' }
        } else {
          l.paint = { ...l.paint, 'line-color': '#615c68' }
        }
      }
    }
    // 6. Light porcelain 3D buildings — a lit model on a dark table
    else if (l.id === 'building-3d') {
      l.minzoom = 13
      l.paint = {
        ...l.paint,
        'fill-extrusion-color': '#eef0ee',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
        'fill-extrusion-vertical-gradient': true,
        'fill-extrusion-opacity': 0.98,
      }
    }
    // 7. Hide text labels & clutter for clean architectural model maquette
    else if (l.type === 'symbol') {
      l.layout = { ...(l.layout || {}), visibility: 'none' }
    }
  })

  // Multi-stage realistic cast shadows on the ground beneath the 3D buildings
  const bIndex = cloned.layers.findIndex((l) => l.id === 'building-3d')
  const shadows: any[] = [
    {
      id: 'resilia-shadow-contact',
      type: 'fill',
      source: vectorSourceId,
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.5,
        'fill-translate': [-2.5, 3.5],
        'fill-translate-anchor': 'viewport',
      },
    },
    {
      id: 'resilia-shadow-cast',
      type: 'fill',
      source: vectorSourceId,
      'source-layer': 'building',
      minzoom: 13,
      filter: ['>=', ['coalesce', ['get', 'render_height'], ['get', 'height'], 0], 4],
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.34,
        'fill-translate': [-6.5, 9],
        'fill-translate-anchor': 'viewport',
      },
    },
    {
      id: 'resilia-shadow-tall',
      type: 'fill',
      source: vectorSourceId,
      'source-layer': 'building',
      minzoom: 13,
      filter: ['>=', ['coalesce', ['get', 'render_height'], ['get', 'height'], 0], 12],
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.22,
        'fill-translate': [-14, 19],
        'fill-translate-anchor': 'viewport',
      },
    },
    {
      id: 'resilia-shadow-highrise',
      type: 'fill',
      source: vectorSourceId,
      'source-layer': 'building',
      minzoom: 13,
      filter: ['>=', ['coalesce', ['get', 'render_height'], ['get', 'height'], 0], 24],
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 0.14,
        'fill-translate': [-22, 30],
        'fill-translate-anchor': 'viewport',
      },
    },
  ]

  if (bIndex !== -1) {
    cloned.layers.splice(bIndex, 0, ...shadows)
  } else {
    cloned.layers.push(...shadows)
  }

  return cloned
}

function setupMapLightingAndShadows(map: MapLibreMap) {
  // Ensure lighting is set on the map instance
  map.setLight({
    anchor: 'viewport',
    position: [1.5, 325, 62],
    color: '#f6f1e8',
    intensity: 0.6,
  })

  const style = map.getStyle() as StyleSpecification
  const sources = style.sources ?? {}
  const vectorSourceId = Object.keys(sources).find((key) => sources[key].type === 'vector')
  if (!vectorSourceId) return

  // If building-3d was not in the style, add fallback extrusion
  if (!map.getLayer('building-3d') && !map.getLayer('resilia-3d-buildings')) {
    map.addLayer({
      id: 'resilia-3d-buildings',
      source: vectorSourceId,
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 13,
      paint: {
        'fill-extrusion-color': '#eef0ee',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 10],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
        'fill-extrusion-vertical-gradient': true,
        'fill-extrusion-opacity': 0.97,
      },
    })
  }
}

function addTwinLayers(
  map: MapLibreMap,
  twinMarkerRefs: React.MutableRefObject<Marker[]>,
  infraMarkerMapRef: React.MutableRefObject<Map<string, Marker>>,
) {
  // Vegetation
  map.addSource('vegetation', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: VEGETATION_ZONES.map((z) => ({
        type: 'Feature',
        properties: { name: z.name },
        geometry: { type: 'Polygon', coordinates: [z.boundary] },
      })),
    },
  })
  map.addLayer({
    id: 'vegetation-fill',
    type: 'fill',
    source: 'vegetation',
    paint: { 'fill-color': '#2f6b6f', 'fill-opacity': 0.34 },
  })
  map.addLayer({
    id: 'vegetation-outline',
    type: 'line',
    source: 'vegetation',
    paint: { 'line-color': '#4a94a0', 'line-width': 1.2, 'line-opacity': 0.75 },
  })

  // Neighborhood boundaries
  map.addSource('neighborhoods', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: NEIGHBORHOODS.map((n) => ({
        type: 'Feature',
        properties: { name: n.name },
        geometry: { type: 'Polygon', coordinates: [n.boundary] },
      })),
    },
  })
  map.addLayer({
    id: 'neighborhood-outline',
    type: 'line',
    source: 'neighborhoods',
    paint: { 'line-color': '#38bdf8', 'line-width': 1.5, 'line-dasharray': [2, 2], 'line-opacity': 0.65 },
  })

  // Roads
  map.addSource('roads', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: ROADS.map((r) => ({
        type: 'Feature',
        properties: { id: r.id, name: r.name, capacity: r.capacity, status: 'clear' },
        geometry: { type: 'LineString', coordinates: r.points },
      })),
    },
  })
  map.addLayer({
    id: 'roads-line',
    type: 'line',
    source: 'roads',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': [
        'match',
        ['get', 'status'],
        'blocked',
        '#e2483f',
        'threatened',
        '#ff9b66',
        'smoke_hazard',
        '#e0a83d',
        '#00c3e6',
      ],
      'line-width': [
        'match',
        ['get', 'status'],
        'blocked',
        4.5,
        'threatened',
        4.0,
        3.5,
      ],
      'line-opacity': 0.95,
    },
  })

  // Critical infrastructure
  infraMarkerMapRef.current.clear()
  INFRASTRUCTURE.forEach((infra) => {
    const el = document.createElement('div')
    el.className = `city-map__infra city-map__infra--${infra.type}`
    el.textContent = INFRA_LABEL[infra.type]
    const marker = new Marker({ element: el })
      .setLngLat(infra.position)
      .setPopup(new Popup({ offset: 14 }).setText(infra.name))
      .addTo(map)
    twinMarkerRefs.current.push(marker)
    infraMarkerMapRef.current.set(infra.id, marker)
  })

  // Ignition point
  const ignitionEl = document.createElement('div')
  ignitionEl.className = 'city-map__ignition'
  const ignitionMarker = new Marker({ element: ignitionEl })
    .setLngLat(IGNITION_POINT.position)
    .setPopup(new Popup({ offset: 16 }).setText(IGNITION_POINT.label))
    .addTo(map)
  twinMarkerRefs.current.push(ignitionMarker)
}

const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection' as const, features: [] }

function addFireLayers(map: MapLibreMap) {
  map.addSource('smoke', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION })
  map.addLayer({
    id: 'smoke-fill',
    type: 'fill',
    source: 'smoke',
    paint: { 'fill-color': '#8b96a8', 'fill-opacity': 0.22 },
  })
  map.addLayer({
    id: 'smoke-haze',
    type: 'line',
    source: 'smoke',
    paint: { 'line-color': '#a7b3c6', 'line-width': 8, 'line-blur': 8, 'line-opacity': 0.34 },
  })

  map.addSource('fire-burned', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION })
  map.addLayer({
    id: 'fire-burned-fill',
    type: 'fill',
    source: 'fire-burned',
    paint: { 'fill-color': '#421612', 'fill-opacity': 0.62 },
  })

  map.addSource('fire-front', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION })
  map.addLayer({
    id: 'fire-front-fill',
    type: 'fill',
    source: 'fire-front',
    paint: { 'fill-color': '#ff5a26', 'fill-opacity': 0.82 },
  })
  map.addLayer({
    id: 'fire-front-glow',
    type: 'line',
    source: 'fire-front',
    paint: { 'line-color': '#ff9b66', 'line-width': 4.5, 'line-blur': 5, 'line-opacity': 0.85 },
  })
  map.addLayer({
    id: 'fire-front-core',
    type: 'line',
    source: 'fire-front',
    paint: { 'line-color': '#ffe082', 'line-width': 1.2, 'line-opacity': 0.95 },
  })
}

function updateFireLayers(
  map: MapLibreMap,
  frame: SimulationFrame | null | undefined,
  infraMarkerMapRef: React.MutableRefObject<Map<string, Marker>>,
) {
  const smokeSource = map.getSource('smoke') as GeoJSONSource | undefined
  const burnedSource = map.getSource('fire-burned') as GeoJSONSource | undefined
  const frontSource = map.getSource('fire-front') as GeoJSONSource | undefined
  const roadsSource = map.getSource('roads') as GeoJSONSource | undefined
  if (!smokeSource || !burnedSource || !frontSource) return

  if (!frame) {
    smokeSource.setData(EMPTY_FEATURE_COLLECTION)
    burnedSource.setData(EMPTY_FEATURE_COLLECTION)
    frontSource.setData(EMPTY_FEATURE_COLLECTION)
    if (roadsSource) {
      roadsSource.setData({
        type: 'FeatureCollection',
        features: ROADS.map((r) => ({
          type: 'Feature',
          properties: { id: r.id, name: r.name, capacity: r.capacity, status: 'clear' },
          geometry: { type: 'LineString', coordinates: r.points },
        })),
      })
    }
    return
  }

  smokeSource.setData({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [frame.smokeRing] } }],
  })

  burnedSource.setData(
    frame.previousFireRing
      ? {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [frame.previousFireRing] } }],
        }
      : EMPTY_FEATURE_COLLECTION,
  )

  frontSource.setData({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: frame.previousFireRing ? [frame.fireRing, frame.previousFireRing] : [frame.fireRing],
        },
      },
    ],
  })

  // Dynamically update road status
  if (roadsSource && frame.impact?.roads) {
    const roadStatusMap = new Map(frame.impact.roads.map((r) => [r.id, r.status]))
    roadsSource.setData({
      type: 'FeatureCollection',
      features: ROADS.map((r) => ({
        type: 'Feature',
        properties: {
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          status: roadStatusMap.get(r.id) ?? 'clear',
        },
        geometry: { type: 'LineString', coordinates: r.points },
      })),
    })
  }

  // Dynamically update critical infrastructure markers
  if (frame.impact?.threatenedInfrastructure && infraMarkerMapRef.current) {
    frame.impact.threatenedInfrastructure.forEach((threat) => {
      const marker = infraMarkerMapRef.current.get(threat.id)
      if (!marker) return
      const el = marker.getElement()
      el.classList.remove(
        'city-map__infra--status-safe',
        'city-map__infra--status-alert',
        'city-map__infra--status-threatened',
        'city-map__infra--status-compromised',
      )
      el.classList.add(`city-map__infra--status-${threat.status}`)

      const statusTagClass = `impact-status-tag impact-status-tag--${threat.status}`
      const popupHtml = `
        <div class="city-map__popup">
          <div class="city-map__popup-title">${threat.name}</div>
          <div class="city-map__popup-row">
            <span>Status:</span>
            <span class="${statusTagClass}">${threat.status.toUpperCase()}</span>
          </div>
          ${
            threat.status !== 'safe'
              ? `<div class="city-map__popup-row"><span>Fire proximity:</span><strong>${threat.distanceToFireMeters} m</strong></div>`
              : '<div class="city-map__popup-row"><span>Fire proximity:</span><span>Perimeter clear</span></div>'
          }
        </div>
      `
      marker.getPopup().setHTML(popupHtml)
    })
  }
}
