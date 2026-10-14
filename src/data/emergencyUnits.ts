import { INFRASTRUCTURE, type LngLat } from './demoCity'

export type EmergencyUnitType = 'fireEngine' | 'ambulance' | 'command'

export type EmergencyUnit = {
  id: string
  callsign: string
  shortLabel: string
  type: EmergencyUnitType
  stationName: string
  /** Station position. Offset slightly from the facility marker so both stay readable. */
  home: LngLat
  color: string
  /** Pixel offset so overlapping assignments stay visible on the map. */
  lineOffset: number
}

function facility(id: string): LngLat {
  const found = INFRASTRUCTURE.find((item) => item.id === id)
  if (!found) throw new Error(`Missing facility ${id}`)
  return found.position
}

const station = facility('station-4')
const hospital = facility('ridge-hospital')
const shelter = facility('central-shelter')

export const EMERGENCY_UNITS: EmergencyUnit[] = [
  {
    id: 'engine-01',
    callsign: 'Engine 01',
    shortLabel: 'E1',
    type: 'fireEngine',
    stationName: 'Fire Station 4',
    home: [station[0], station[1] + 0.00036],
    color: '#ff6a3d',
    lineOffset: -4,
  },
  {
    id: 'engine-02',
    callsign: 'Engine 02',
    shortLabel: 'E2',
    type: 'fireEngine',
    stationName: 'Fire Station 4',
    home: [station[0] + 0.00046, station[1]],
    color: '#ffb15a',
    lineOffset: -1,
  },
  {
    id: 'ambulance-01',
    callsign: 'Ambulance 01',
    shortLabel: 'A1',
    type: 'ambulance',
    stationName: 'Ridgeline Medical Center',
    home: [hospital[0], hospital[1] - 0.00036],
    color: '#e2483f',
    lineOffset: 2,
  },
  {
    id: 'command-01',
    callsign: 'Command Unit',
    shortLabel: 'CMD',
    type: 'command',
    stationName: 'Central Avenue Shelter',
    home: [shelter[0] - 0.00046, shelter[1]],
    color: '#3fc6d4',
    lineOffset: 5,
  },
]

export function findEmergencyUnit(id: string): EmergencyUnit | undefined {
  return EMERGENCY_UNITS.find((unit) => unit.id === id)
}
