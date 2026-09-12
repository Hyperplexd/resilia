export type LngLat = [number, number]

export type Road = {
  id: string
  name: string
  capacity: number
  points: LngLat[]
}

export type VegetationZone = {
  id: string
  name: string
  boundary: LngLat[]
}

export type Neighborhood = {
  id: string
  name: string
  boundary: LngLat[]
}

export type Infrastructure = {
  id: string
  name: string
  type: 'hospital' | 'school' | 'fireStation' | 'shelter' | 'power'
  position: LngLat
}

export type IgnitionPoint = {
  id: string
  label: string
  position: LngLat
}

// Coordinates are [lng, lat] — GeoJSON order. Hand-authored around the same
// Cedar Ridge cluster used in demoAddresses.ts; not survey-accurate, built
// for a coherent, plausible-looking digital twin.

export const ROADS: Road[] = [
  {
    id: 'central-ave',
    name: 'Central Avenue',
    capacity: 100,
    points: [
      [-118.706, 34.066],
      [-118.7, 34.068],
      [-118.693, 34.0705],
      [-118.685, 34.0735],
      [-118.678, 34.0765],
    ],
  },
  {
    id: 'mountain-road',
    name: 'Mountain Road',
    capacity: 60,
    points: [
      [-118.693, 34.0705],
      [-118.689, 34.073],
      [-118.687, 34.0755],
      [-118.684, 34.078],
    ],
  },
  {
    id: 'pine-street',
    name: 'Pine Street',
    capacity: 40,
    points: [
      [-118.7, 34.068],
      [-118.6955, 34.0695],
      [-118.6919, 34.07],
    ],
  },
  {
    id: 'ridgeline-drive',
    name: 'Ridgeline Drive',
    capacity: 50,
    points: [
      [-118.687, 34.0755],
      [-118.683, 34.077],
      [-118.68, 34.079],
      [-118.676, 34.0815],
    ],
  },
  {
    id: 'hollow-creek-lane',
    name: 'Hollow Creek Lane',
    capacity: 35,
    points: [
      [-118.7, 34.068],
      [-118.697, 34.066],
      [-118.695, 34.065],
      [-118.692, 34.0635],
    ],
  },
]

export const VEGETATION_ZONES: VegetationZone[] = [
  {
    id: 'ridgeline-forest',
    name: 'Ridgeline forest edge',
    boundary: [
      [-118.681, 34.078],
      [-118.673, 34.079],
      [-118.671, 34.086],
      [-118.679, 34.0875],
      [-118.685, 34.082],
      [-118.681, 34.078],
    ],
  },
  {
    id: 'creek-brush',
    name: 'Hollow Creek brushland',
    boundary: [
      [-118.696, 34.0635],
      [-118.69, 34.061],
      [-118.687, 34.0645],
      [-118.691, 34.0665],
      [-118.696, 34.0635],
    ],
  },
]

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'lower-village',
    name: 'Lower Village',
    boundary: [
      [-118.6945, 34.0685],
      [-118.6895, 34.0685],
      [-118.6895, 34.0725],
      [-118.6945, 34.0725],
      [-118.6945, 34.0685],
    ],
  },
  {
    id: 'ridgeline',
    name: 'Ridgeline',
    boundary: [
      [-118.69, 34.073],
      [-118.681, 34.073],
      [-118.681, 34.0805],
      [-118.69, 34.0805],
      [-118.69, 34.073],
    ],
  },
  {
    id: 'town-center',
    name: 'Town Center',
    boundary: [
      [-118.703, 34.0655],
      [-118.6965, 34.0655],
      [-118.6965, 34.0705],
      [-118.703, 34.0705],
      [-118.703, 34.0655],
    ],
  },
  {
    id: 'creekside',
    name: 'Creekside',
    boundary: [
      [-118.698, 34.063],
      [-118.6905, 34.063],
      [-118.6905, 34.0675],
      [-118.698, 34.0675],
      [-118.698, 34.063],
    ],
  },
]

export const INFRASTRUCTURE: Infrastructure[] = [
  { id: 'ridge-hospital', name: 'Ridgeline Medical Center', type: 'hospital', position: [-118.685, 34.0745] },
  { id: 'cedar-elementary', name: 'Cedar Ridge Elementary', type: 'school', position: [-118.6975, 34.0698] },
  { id: 'station-4', name: 'Fire Station 4', type: 'fireStation', position: [-118.6935, 34.0675] },
  { id: 'central-shelter', name: 'Central Avenue Shelter', type: 'shelter', position: [-118.699, 34.0665] },
  { id: 'substation-9', name: 'Substation 9', type: 'power', position: [-118.6905, 34.0715] },
]

export const IGNITION_POINT: IgnitionPoint = {
  id: 'ridgeline-forest-edge',
  label: 'Ignition — Ridgeline forest edge',
  position: [-118.6765, 34.081],
}

export const CITY_CENTER: LngLat = [-118.693, 34.072]
