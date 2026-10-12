import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import ImpactCards from '../../components/metrics/ImpactCards'
import ScenarioPanel from '../../components/scenario/ScenarioPanel'
import Timeline from '../../components/timeline/Timeline'
import { useAuth } from '../../auth/AuthContext'
import { findAddress, readStoredAddressId, storeAddressId } from '../../data/demoAddresses'
import { useSimulation } from '../../hooks/useSimulation'
import { CITY_CENTER, IGNITION_POINT } from '../../data/demoCity'
import type { LngLat } from '../../simulation/simulationTypes'
import './Simulation.css'

export default function SimulationPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const [searchParams] = useSearchParams()
  const addressId = searchParams.get('address') ?? (role === 'resident' ? readStoredAddressId() : null)
  const address = addressId ? findAddress(addressId) : undefined
  const ignition = useMemo<LngLat>(
    () => (address ? [address.lng, address.lat] : IGNITION_POINT.position),
    [address],
  )
  const sim = useSimulation(ignition)

  useEffect(() => {
    if (role === 'resident' && address) storeAddressId(address.id)
  }, [role, address])

  return (
    <Shell>
      <div className="simulation">
        <div className="simulation__origin">
          <p>
            {address ? (
              <>
                Wildfire ignition at <strong>{address.label}</strong>
                <span className="simulation__origin-detail"> · {address.neighborhood}</span>
              </>
            ) : (
              <>
                Wildfire ignition at <strong>{IGNITION_POINT.label}</strong>
              </>
            )}
          </p>
          {role === 'resident' && (
            <button type="button" className="simulation__change-address" onClick={() => navigate('/resident')}>
              Change demo address
            </button>
          )}
        </div>

        <ImpactCards
          impact={sim.currentFrame.impact}
          traffic={sim.currentFrame.traffic}
          areaHectares={sim.currentFrame.areaHectares}
          time={Math.round(sim.currentFrame.time)}
        />

        <div className="simulation__body">
          <ScenarioPanel scenario={sim.scenario} onChange={sim.setScenario} />

          <div className="simulation__map-col">
            <div className="simulation__map-wrap">
              <CityMap
                center={
                  address
                    ? { lat: address.lat, lng: address.lng }
                    : { lat: CITY_CENTER[1], lng: CITY_CENTER[0] }
                }
                zoom={address ? 15 : 14.5}
                pitch={55}
                showTwin
                fireFrame={sim.currentFrame}
                ignition={
                  address
                    ? { lat: address.lat, lng: address.lng, label: `Ignition — ${address.label}` }
                    : undefined
                }
              />
            </div>
            <div className="simulation__readout">
              <span>
                Time since ignition <strong className="data-value">T+{String(Math.round(sim.currentFrame.time)).padStart(2, '0')} min</strong>
              </span>
              <span>
                Fire perimeter <strong className="data-value">{sim.currentFrame.impact.perimeterKm.toFixed(1)} km</strong>
              </span>
              <span>
                Avg evacuation speed <strong className="data-value">{sim.currentFrame.traffic?.networkAverageSpeedKmh ?? 50} km/h</strong>
              </span>
              <span>
                Throughput <strong className="data-value">{sim.currentFrame.traffic?.activeEvacuationThroughput ?? 0} veh/min</strong>
              </span>
            </div>
          </div>
        </div>

        <Timeline
          frames={sim.frames}
          progress={sim.progress}
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
