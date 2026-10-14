import { useMemo, useState } from 'react'
import type { SimulationFrame } from '../../simulation/simulationTypes'
import {
  listResponseTargets,
  type ResponseSnapshot,
  type ResponseTarget,
  type ResponseTargetKind,
  type UnitStatus,
} from '../../simulation/responseModel'
import './ResponsePanel.css'

type ResponsePanelProps = {
  frame: SimulationFrame
  snapshot: ResponseSnapshot
  onDeploy: (unitId: string, target: ResponseTarget) => void
  onRecall: (unitId: string) => void
}

const TARGET_GROUPS: { kind: ResponseTargetKind; label: string }[] = [
  { kind: 'fire_front', label: 'Fire front' },
  { kind: 'neighborhood', label: 'Neighborhood' },
  { kind: 'hospital', label: 'Hospital' },
  { kind: 'evacuation_zone', label: 'Evacuation zone' },
  { kind: 'choke_point', label: 'Choke point' },
]

function statusWord(status: UnitStatus): string {
  if (status === 'on_scene') return 'ON SCENE'
  if (status === 'deployed') return 'DEPLOYED'
  return 'STAGED'
}

export default function ResponsePanel({ frame, snapshot, onDeploy, onRecall }: ResponsePanelProps) {
  const targets = useMemo(() => listResponseTargets(frame), [frame])
  const [unitId, setUnitId] = useState(snapshot.units[0]?.id ?? '')
  const [targetId, setTargetId] = useState('')
  const resolvedTargetId = targets.some((item) => item.id === targetId) ? targetId : ''

  const selected = snapshot.units.find((unit) => unit.id === unitId) ?? snapshot.units[0]
  const target = targets.find((item) => item.id === resolvedTargetId)

  return (
    <section className="response-panel" aria-label="Emergency response">
      <header className="response-panel__header">
        <h2 className="response-panel__title">Emergency response</h2>
        <p className="response-panel__summary">
          <span className="data-value">{snapshot.deployedCount}</span> deployed
          <span className="response-panel__dot" aria-hidden="true" />
          <span className="data-value">{snapshot.onSceneCount}</span> on scene
          {snapshot.soonestEtaLabel && (
            <>
              <span className="response-panel__dot" aria-hidden="true" />
              next ETA <span className="data-value">{snapshot.soonestEtaLabel}</span>
            </>
          )}
        </p>
      </header>

      {selected && (
        <div className="response-panel__controls">
          <label className="response-panel__field">
            Target for {selected.callsign}
            <select value={resolvedTargetId} onChange={(event) => setTargetId(event.target.value)}>
              <option value="">Select a target</option>
              {TARGET_GROUPS.map((group) => {
                const options = targets.filter((item) => item.kind === group.kind)
                if (options.length === 0) return null
                return (
                  <optgroup key={group.kind} label={group.label}>
                    {options.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </label>
          <div className="response-panel__actions">
            <button
              type="button"
              className="response-panel__deploy"
              disabled={!target}
              onClick={() => {
                if (!target) return
                onDeploy(selected.id, target)
              }}
            >
              Deploy unit
            </button>
            <button
              type="button"
              className="response-panel__recall"
              disabled={!selected.assigned}
              onClick={() => onRecall(selected.id)}
            >
              Recall
            </button>
          </div>
          <p className="response-panel__hint">
            The unit follows the road network from this minute. Playback moves it, and the ETA counts down with the timeline.
          </p>
        </div>
      )}

      <ul className="response-panel__units">
        {snapshot.units.map((unit) => {
          const active = unit.id === selected?.id
          return (
            <li key={unit.id}>
              <button
                type="button"
                className={`response-unit${active ? ' response-unit--selected' : ''}`}
                aria-pressed={active}
                onClick={() => setUnitId(unit.id)}
              >
                <span className="response-unit__top">
                  <span className="response-unit__swatch" style={{ background: unit.color }} aria-hidden="true" />
                  <span className="response-unit__call">{unit.callsign}</span>
                  <span className={`response-unit__badge response-unit__badge--${unit.status}`}>{statusWord(unit.status)}</span>
                </span>
                {unit.assigned && unit.targetLabel ? (
                  <span className="response-unit__dest">→ {unit.targetLabel}</span>
                ) : (
                  <span className="response-unit__dest">{unit.stationName}</span>
                )}
                {unit.status === 'deployed' && unit.etaLabel && (
                  <span className="response-unit__eta">
                    ETA <span className="data-value">{unit.etaLabel}</span>
                  </span>
                )}
                {unit.status === 'staged' && unit.assigned && unit.departsAtMinute != null && (
                  <span className="response-unit__eta">
                    Departs <span className="data-value">T+{String(Math.round(unit.departsAtMinute)).padStart(2, '0')}</span>
                  </span>
                )}
                {unit.forced && unit.assigned && unit.status !== 'staged' && (
                  <span className="response-unit__note">Route uses a closed road</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
