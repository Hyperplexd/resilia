import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import { DEMO_ADDRESSES, findAddress } from '../../data/demoAddresses'
import { IGNITION_POINT } from '../../data/demoCity'
import { DEFAULT_SCENARIO } from '../../simulation/scenarios'
import { evaluatePointAgainstFire } from '../../simulation/impactModel'
import './Resident.css'

export default function ResidentPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? findAddress(selectedId) : undefined
  const navigate = useNavigate()

  return (
    <Shell>
      <div className="resident">
        <aside className="resident__panel">
          <label className="resident__label" htmlFor="address-select">
            Your address
          </label>
          <select
            id="address-select"
            className="resident__select"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
          >
            <option value="" disabled>
              Choose a demo address&hellip;
            </option>
            {DEMO_ADDRESSES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>

          {selected ? (
            <div className="resident__location">
              <p className="resident__location-label">Location confirmed</p>
              <p className="resident__location-name">{selected.label}</p>
              <p className="resident__location-neighborhood">{selected.neighborhood}</p>

              {(() => {
                const assessment = evaluatePointAgainstFire(
                  [selected.lng, selected.lat],
                  IGNITION_POINT.position,
                  15,
                  DEFAULT_SCENARIO,
                )
                const isHigh = assessment.insideFire || assessment.distanceToFireMeters <= 350
                const isMedium = assessment.insideSmoke || assessment.distanceToFireMeters <= 850
                const status = isHigh ? 'HIGH RISK' : isMedium ? 'ELEVATED ADVISORY' : 'LOW RISK'
                const statusClass = isHigh ? 'resident__risk--critical' : isMedium ? 'resident__risk--warning' : 'resident__risk--ok'

                return (
                  <div className="resident__assessment">
                    <div className="resident__assessment-row">
                      <span>Assessed Threat Level:</span>
                      <strong className={`resident__risk-badge ${statusClass}`}>{status}</strong>
                    </div>
                    <div className="resident__assessment-row">
                      <span>Proximity to Hero Firefront:</span>
                      <strong className="data-value">{assessment.distanceToFireMeters.toLocaleString()} m</strong>
                    </div>
                    <div className="resident__assessment-row">
                      <span>Smoke Exposure:</span>
                      <span>{assessment.insideSmoke ? 'Plume engulfment' : 'Air quality clear'}</span>
                    </div>
                  </div>
                )
              })()}

              <button className="resident__launch" onClick={() => navigate('/simulation')}>
                What happens if wildfire starts here?
              </button>
            </div>
          ) : (
            <p className="resident__hint">
              Pick an address to center the map on your location and inspect your neighborhood's simulated fire threat, proximity, and impact horizon.
            </p>
          )}
        </aside>

        <div className="resident__map-wrap">
          <CityMap
            center={selected ? { lat: selected.lat, lng: selected.lng } : { lat: 34.072, lng: -118.693 }}
            zoom={selected ? 15 : 13}
            markers={selected ? [{ id: selected.id, lat: selected.lat, lng: selected.lng, label: selected.label }] : []}
          />
        </div>
      </div>
    </Shell>
  )
}
