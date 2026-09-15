import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import ImpactCards from '../../components/metrics/ImpactCards'
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
        <ImpactCards
          impact={sim.currentFrame.impact}
          areaHectares={sim.currentFrame.areaHectares}
          time={sim.currentFrame.time}
        />

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
                Fire perimeter <strong className="data-value">{sim.currentFrame.impact.perimeterKm.toFixed(1)} km</strong>
              </span>
              <span>
                Spread rate <strong className="data-value">{sim.currentFrame.impact.spreadRateMetersPerMin} m/min</strong>
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
          Digital twin — Cedar Ridge. Deterministic impact analytics (population exposure,
          buildings at risk, road network disruption, and critical infrastructure proximity alerts)
          update live as time advances. The same scenario inputs always produce the same deterministic outcome.
        </p>
      </div>
    </Shell>
  )
}
