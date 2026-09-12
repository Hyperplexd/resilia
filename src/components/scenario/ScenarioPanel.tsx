import type { Level, ScenarioInput, Severity, WindDirection } from '../../simulation/simulationTypes'
import { LEVELS, SEVERITIES, WIND_DIRECTIONS } from '../../simulation/scenarios'
import './ScenarioPanel.css'

type ScenarioPanelProps = {
  scenario: ScenarioInput
  onChange: (scenario: ScenarioInput) => void
}

export default function ScenarioPanel({ scenario, onChange }: ScenarioPanelProps) {
  return (
    <div className="scenario-panel">
      <p className="scenario-panel__title">Scenario parameters</p>

      <label className="scenario-panel__field">
        <span>Wind direction</span>
        <select
          value={scenario.windDirection}
          onChange={(e) => onChange({ ...scenario, windDirection: e.target.value as WindDirection })}
        >
          {WIND_DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="scenario-panel__field">
        <span>Wind speed</span>
        <select value={scenario.windSpeed} onChange={(e) => onChange({ ...scenario, windSpeed: e.target.value as Level })}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="scenario-panel__field">
        <span>Dryness</span>
        <select value={scenario.dryness} onChange={(e) => onChange({ ...scenario, dryness: e.target.value as Level })}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="scenario-panel__field">
        <span>Severity</span>
        <select value={scenario.severity} onChange={(e) => onChange({ ...scenario, severity: e.target.value as Severity })}>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <p className="scenario-panel__hint">Changing any value restarts the simulation at T+00.</p>
    </div>
  )
}
