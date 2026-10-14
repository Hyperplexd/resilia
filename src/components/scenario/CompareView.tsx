import { useEffect, useId, useMemo, useState } from 'react'
import CityMap from '../map/CityMap'
import { CITY_CENTER } from '../../data/demoCity'
import {
  COMPARE_ROWS,
  compareLead,
  deltaLabel,
  deltaTone,
  ignitionForSaved,
  responseAt,
  snapshotAt,
} from '../../simulation/compareScenarios'
import { runSimulation } from '../../simulation/simulationEngine'
import { TIME_POINTS } from '../../simulation/scenarios'
import type { SavedScenario } from '../../simulation/savedScenarios'
import type { SimulationFrame } from '../../simulation/simulationTypes'
import './CompareView.css'

type CompareViewProps = {
  scenarioA: SavedScenario
  scenarioB: SavedScenario
  onClose: () => void
}

export default function CompareView({ scenarioA, scenarioB, onClose }: CompareViewProps) {
  const titleId = useId()
  const [nodeIndex, setNodeIndex] = useState(() => Math.max(scenarioA.nodeIndex, scenarioB.nodeIndex))

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const framesA = useMemo(
    () => runSimulation(ignitionForSaved(scenarioA), scenarioA.parameters, TIME_POINTS),
    [scenarioA],
  )
  const framesB = useMemo(
    () => runSimulation(ignitionForSaved(scenarioB), scenarioB.parameters, TIME_POINTS),
    [scenarioB],
  )
  const frameA = framesA[nodeIndex] ?? framesA[0]
  const frameB = framesB[nodeIndex] ?? framesB[0]
  const snapA = snapshotAt(frameA, scenarioA.orders)
  const snapB = snapshotAt(frameB, scenarioB.orders)
  const minute = TIME_POINTS[nodeIndex] ?? 0

  return (
    <div className="compare__backdrop">
      <div className="compare" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="compare__header">
          <div>
            <p className="compare__kicker">Compare</p>
            <h2 id={titleId}>Scenario A and Scenario B</h2>
          </div>
          <button type="button" className="compare__close" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="compare__lead">{compareLead(scenarioA.name, scenarioB.name, minute, snapA, snapB)}</p>

        <div className="compare__maps">
          <CompareMap label="A" scenario={scenarioA} frame={frameA} minute={minute} />
          <CompareMap label="B" scenario={scenarioB} frame={frameB} minute={minute} />
        </div>

        <div className="compare__clock" role="group" aria-label="Comparison minute">
          {TIME_POINTS.map((point, index) => (
            <button
              key={point}
              type="button"
              className={index === nodeIndex ? 'compare__tick compare__tick--active' : 'compare__tick'}
              onClick={() => setNodeIndex(index)}
            >
              T+{String(point).padStart(2, '0')}
            </button>
          ))}
        </div>

        <table className="compare__table">
          <thead>
            <tr>
              <th scope="col"> </th>
              <th scope="col">A</th>
              <th scope="col">B</th>
              <th scope="col">B vs A</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => {
              const tone = deltaTone(snapA[row.key], snapB[row.key], row.higherIsWorse)
              return (
                <tr key={row.key} className={tone === 'worse' ? 'compare__row--worse' : undefined}>
                  <th scope="row">{row.label}</th>
                  <td className="data-value">{row.format(snapA[row.key])}</td>
                  <td className="data-value">{row.format(snapB[row.key])}</td>
                  <td className={`data-value compare__delta compare__delta--${tone}`}>
                    {deltaLabel(snapA[row.key], snapB[row.key])}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CompareMap({
  label,
  scenario,
  frame,
  minute,
}: {
  label: 'A' | 'B'
  scenario: SavedScenario
  frame: SimulationFrame
  minute: number
}) {
  const ignition = ignitionForSaved(scenario)
  const response = responseAt(frame, scenario.orders)
  return (
    <section className="compare__side">
      <div className="compare__side-head">
        <span className={label === 'A' ? 'compare__badge compare__badge--a' : 'compare__badge compare__badge--b'}>{label}</span>
        <div>
          <h3>{scenario.name}</h3>
          <p>
            {scenario.parameters.windDirection} wind · {scenario.parameters.windSpeed} · dryness {scenario.parameters.dryness} · {scenario.parameters.severity}
            <span> · {scenario.ignitionLabel}</span>
            {scenario.minute !== minute && <span> · saved at T+{String(scenario.minute).padStart(2, '0')}</span>}
          </p>
        </div>
      </div>
      <div className="compare__map">
        <CityMap
          center={{ lat: CITY_CENTER[1], lng: CITY_CENTER[0] }}
          zoom={13.6}
          pitch={48}
          showTwin
          staticView
          fireFrame={frame}
          response={response}
          ignition={{ lat: ignition[1], lng: ignition[0], label: scenario.ignitionLabel }}
        />
      </div>
    </section>
  )
}
