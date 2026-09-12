import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import ScenarioPanel from '../../components/scenario/ScenarioPanel'
import Timeline from '../../components/timeline/Timeline'
import { useSimulation } from '../../hooks/useSimulation'
import { CITY_CENTER, IGNITION_POINT } from '../../data/demoCity'
import './Simulation.css'

export default function SimulationPage() {
  const sim = useSimulation(IGNITION_POINT.position)

  return (
    <Shell>
      <div className="simulation">
        <div className="simulation__body">
          <ScenarioPanel scenario={sim.scenario} onChange={sim.setScenario} />

          <div className="simulation__map-col">
            <div className="simulation__map-wrap">
              <CityMap
                center={{ lat: CITY_CENTER[1], lng: CITY_CENTER[0] }}
                zoom={14.5}
                pitch={55}
                showTwin
                fireFrame={sim.currentFrame}
              />
            </div>
            <div className="simulation__readout">
              <span>
                Time since ignition <strong className="data-value">T+{String(sim.currentFrame.time).padStart(2, '0')} min</strong>
              </span>
              <span>
                Fire area <strong className="data-value">{sim.currentFrame.areaHectares.toFixed(1)} ha</strong>
              </span>
            </div>
          </div>
        </div>

        <Timeline
          frames={sim.frames}
          index={sim.index}
          isPlaying={sim.isPlaying}
          speed={sim.speed}
          onPlay={sim.play}
          onPause={sim.pause}
          onPrev={sim.prev}
          onStep={sim.step}
          onReset={sim.reset}
          onGoTo={sim.goTo}
          onSpeedChange={sim.setSpeed}
        />

        <p className="simulation__note">
          Digital twin — Cedar Ridge. Cyan lines are roads, green zones are
          vegetation/fuel, dashed outlines are neighborhoods, colored badges
          are critical infrastructure. Deep red is already-burned area,
          bright ember is the active fire front, and gray is the smoke
          plume. Deterministic — the same scenario always produces the same
          spread. Traffic, evacuation, and impact metrics arrive in later
          phases.
        </p>
      </div>
    </Shell>
  )
}
