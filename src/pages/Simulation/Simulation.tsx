import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import ImpactCards from '../../components/metrics/ImpactCards'
import ResponsePanel from '../../components/response/ResponsePanel'
import ScenarioPanel from '../../components/scenario/ScenarioPanel'
import Timeline from '../../components/timeline/Timeline'
import { useAuth } from '../../auth/AuthContext'
import { DEMO_ADDRESSES, findAddress, readStoredAddressId, storeAddressId } from '../../data/demoAddresses'
import { findEmergencyUnit } from '../../data/emergencyUnits'
import { useSimulation } from '../../hooks/useSimulation'
import { CITY_CENTER, IGNITION_POINT } from '../../data/demoCity'
import { buildDeploymentOrder, projectResponse, type DeploymentOrder, type ResponseTarget } from '../../simulation/responseModel'
import type { LngLat } from '../../simulation/simulationTypes'
import './Simulation.css'

export default function SimulationPage() {
  const { role } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const addressId = searchParams.get('address') ?? readStoredAddressId()
  const address = addressId ? findAddress(addressId) : undefined
  const ignition = useMemo<LngLat>(
    () => (address ? [address.lng, address.lat] : IGNITION_POINT.position),
    [address],
  )
  const sim = useSimulation(ignition)
  const [orders, setOrders] = useState<DeploymentOrder[]>([])
  const scenarioKey = `${sim.scenario.windDirection}|${sim.scenario.windSpeed}|${sim.scenario.dryness}|${sim.scenario.severity}|${ignition[0]}|${ignition[1]}`
  const [trackedScenario, setTrackedScenario] = useState(scenarioKey)
  if (trackedScenario !== scenarioKey) {
    setTrackedScenario(scenarioKey)
    setOrders([])
    sim.reset()
  }

  useEffect(() => {
    if (address) storeAddressId(address.id)
  }, [address])

  const chooseIgnition = (id: string) => {
    storeAddressId(id || null)
    if (id) setSearchParams({ address: id })
    else setSearchParams({})
  }

  const response = useMemo(
    () => (role === 'authority' ? projectResponse(orders, sim.currentFrame.time) : null),
    [role, orders, sim.currentFrame.time],
  )

  const deployUnit = (unitId: string, target: ResponseTarget) => {
    const current = response?.units.find((unit) => unit.id === unitId)
    const origin = current && current.status !== 'staged' ? current.position : findEmergencyUnit(unitId)?.home
    const order = buildDeploymentOrder(unitId, target, sim.currentFrame.traffic, sim.currentFrame.time, origin)
    setOrders((prev) => [...prev.filter((item) => item.unitId !== unitId), order])
  }

  const recallUnit = (unitId: string) => {
    setOrders((prev) => prev.filter((item) => item.unitId !== unitId))
  }

  return (
    <Shell>
      <div className="simulation">
        <div className="simulation__origin">
          <label className="simulation__ignition" htmlFor="ignition-address">
            <span>Ignition</span>
            <select
              id="ignition-address"
              value={address?.id ?? ''}
              onChange={(event) => chooseIgnition(event.target.value)}
            >
              <option value="">{IGNITION_POINT.label}</option>
              {DEMO_ADDRESSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p>
            {address ? (
              <>
                Wildfire starts at <strong>{address.label}</strong>
                <span className="simulation__origin-detail"> · {address.neighborhood}</span>
              </>
            ) : (
              <>
                Wildfire starts at <strong>{IGNITION_POINT.label}</strong>
              </>
            )}
          </p>
        </div>

        <ImpactCards
          impact={sim.currentFrame.impact}
          traffic={sim.currentFrame.traffic}
          evacuation={sim.currentFrame.evacuation}
          areaHectares={sim.currentFrame.areaHectares}
          time={Math.round(sim.currentFrame.time)}
          response={response}
        />

        <div className="simulation__body">
          <div className="simulation__side">
            <ScenarioPanel scenario={sim.scenario} onChange={sim.setScenario} />
            {response && (
              <ResponsePanel
                frame={sim.currentFrame}
                snapshot={response}
                onDeploy={deployUnit}
                onRecall={recallUnit}
              />
            )}
          </div>

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
                response={response}
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
              <span>
                Clearance <strong className="data-value">{sim.currentFrame.evacuation.clearanceMinutes}{sim.currentFrame.evacuation.clearanceMinutes >= 180 ? '+' : ''} min</strong>
              </span>
              <span>
                Evacuated <strong className="data-value">{Math.round(sim.currentFrame.evacuation.progress * 100)}%</strong>
              </span>
              {response && (
                <span>
                  Response{' '}
                  <strong className="data-value">
                    {response.deployedCount} deployed
                    {response.onSceneCount > 0 ? ` · ${response.onSceneCount} on scene` : ''}
                    {response.soonestEtaLabel ? ` · ETA ${response.soonestEtaLabel}` : ''}
                  </strong>
                </span>
              )}
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
            <b>Cloud9ine</b> Digital twin — The same scenario inputs always produce the same deterministic outcome.
        </p>
      </div>
    </Shell>
  )
}
