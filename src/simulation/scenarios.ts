import type { ScenarioInput } from './simulationTypes'

// Matches the spec's demo "hero scenario": NE wind, high dryness, severe.
export const DEFAULT_SCENARIO: ScenarioInput = {
  windDirection: 'NE',
  windSpeed: 'high',
  dryness: 'high',
  severity: 'severe',
}

export const TIME_POINTS = [0, 5, 10, 15, 20, 25, 30]

export const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const
export const LEVELS = ['low', 'moderate', 'high'] as const
export const SEVERITIES = ['low', 'moderate', 'severe'] as const
