import { useEffect, useId, useState } from 'react'
import {
  assignmentSummary,
  formatSavedAt,
  type SavedScenario,
} from '../../simulation/savedScenarios'
import './SavedScenarios.css'

type SavedScenariosProps = {
  open: boolean
  draftName: string
  scenarios: SavedScenario[]
  activeResultRef: string
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  onLoad: (scenario: SavedScenario) => void
  onRemove: (id: string) => void
  onCompare: (scenarioA: SavedScenario, scenarioB: SavedScenario) => void
}

export default function SavedScenarios({
  open,
  draftName,
  scenarios,
  activeResultRef,
  onOpenChange,
  onSave,
  onLoad,
  onRemove,
  onCompare,
}: SavedScenariosProps) {
  const titleId = useId()
  const nameId = useId()
  const [slotA, setSlotA] = useState<string | null>(null)
  const [slotB, setSlotB] = useState<string | null>(null)
  const scenarioA = scenarios.find((item) => item.id === slotA)
  const scenarioB = scenarios.find((item) => item.id === slotB)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const assign = (slot: 'a' | 'b', id: string) => {
    if (slot === 'a') {
      setSlotA((current) => (current === id ? null : id))
      setSlotB((current) => (current === id ? null : current))
    } else {
      setSlotB((current) => (current === id ? null : id))
      setSlotA((current) => (current === id ? null : current))
    }
  }

  return (
    <>
      <button type="button" className="saved-scenarios__launch" onClick={() => onOpenChange(true)}>
        Save for Review
        {scenarios.length > 0 && <span className="saved-scenarios__count">{scenarios.length}</span>}
      </button>

      {open && (
        <div className="saved-scenarios__backdrop" onClick={() => onOpenChange(false)}>
          <div
            className="saved-scenarios__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="saved-scenarios__header">
              <h2 id={titleId}>Saved scenarios</h2>
              <button type="button" className="saved-scenarios__close" onClick={() => onOpenChange(false)}>
                Close
              </button>
            </div>

            <form
              className="saved-scenarios__form"
              onSubmit={(event) => {
                event.preventDefault()
                const data = new FormData(event.currentTarget)
                const name = String(data.get('name') ?? '').trim()
                if (!name) return
                onSave(name)
              }}
            >
              <label className="saved-scenarios__field" htmlFor={nameId}>
                Name this run
                <input id={nameId} name="name" defaultValue={draftName} maxLength={80} required autoFocus />
              </label>
              <button type="submit" className="saved-scenarios__save">
                Save for Review
              </button>
            </form>
            <p className="saved-scenarios__hint">
              The name, ignition, wind, playhead, dispatches, and the metrics at that minute stay in this browser.
              Opening a row recomputes the same run.
            </p>

            {scenarios.length === 0 ? (
              <p className="saved-scenarios__empty">Nothing saved yet.</p>
            ) : (
              <ul className="saved-scenarios__list">
                {scenarios.map((scenario) => {
                  const onScreen = scenario.resultRef === activeResultRef
                  return (
                    <li key={scenario.id} className={onScreen ? 'saved-scenario saved-scenario--active' : 'saved-scenario'}>
                      <div className="saved-scenario__top">
                        <p className="saved-scenario__name">{scenario.name}</p>
                        {onScreen && <span className="saved-scenario__badge">On screen</span>}
                      </div>
                      <p className="saved-scenario__meta">{formatSavedAt(scenario.savedAt)}</p>
                      <p className="saved-scenario__meta">{scenario.ignitionLabel}</p>
                      <p className="saved-scenario__metrics">
                        {scenario.parameters.windDirection} wind · {scenario.parameters.windSpeed} · dryness {scenario.parameters.dryness} · {scenario.parameters.severity}
                        <span className="saved-scenario__dot" />
                        T+{String(scenario.minute).padStart(2, '0')}
                      </p>
                      <p className="saved-scenario__metrics">
                        {scenario.metrics.areaHectares.toFixed(1)} ha
                        <span className="saved-scenario__dot" />
                        {scenario.metrics.exposedResidents.toLocaleString()} exposed
                        <span className="saved-scenario__dot" />
                        {scenario.metrics.clearanceMinutes} min clearance
                        <span className="saved-scenario__dot" />
                        {scenario.metrics.evacuatedPercent}% evacuated
                        {scenario.metrics.deployedCount > 0 && (
                          <>
                            <span className="saved-scenario__dot" />
                            {scenario.metrics.deployedCount} deployed
                          </>
                        )}
                      </p>
                      {scenario.orders.length > 0 && (
                        <p className="saved-scenario__orders">
                          {scenario.orders.map((order) => assignmentSummary(order)).join(' · ')}
                        </p>
                      )}
                      <div className="saved-scenario__actions">
                        <button
                          type="button"
                          className={scenarioA?.id === scenario.id ? 'saved-scenario__slot saved-scenario__slot--a' : 'saved-scenario__slot'}
                          aria-pressed={scenarioA?.id === scenario.id}
                          onClick={() => assign('a', scenario.id)}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          className={scenarioB?.id === scenario.id ? 'saved-scenario__slot saved-scenario__slot--b' : 'saved-scenario__slot'}
                          aria-pressed={scenarioB?.id === scenario.id}
                          onClick={() => assign('b', scenario.id)}
                        >
                          B
                        </button>
                        <button type="button" className="saved-scenario__open" onClick={() => onLoad(scenario)}>
                          Open
                        </button>
                        <button
                          type="button"
                          className="saved-scenario__remove"
                          onClick={() => {
                            if (slotA === scenario.id) setSlotA(null)
                            if (slotB === scenario.id) setSlotB(null)
                            onRemove(scenario.id)
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="saved-scenarios__compare-row">
              <p className="saved-scenarios__hint">
                {scenarios.length < 2
                  ? 'Save two runs, mark one as A and one as B, then compare them on the same minute.'
                  : 'Mark one run as A and another as B. Compare keeps both maps on the same camera and the same minute.'}
              </p>
              <button
                type="button"
                className="saved-scenarios__compare"
                disabled={!scenarioA || !scenarioB}
                onClick={() => {
                  if (!scenarioA || !scenarioB) return
                  onCompare(scenarioA, scenarioB)
                }}
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
