import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import CityMap from '../../components/map/CityMap'
import { DEMO_ADDRESSES, findAddress } from '../../data/demoAddresses'
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
              <button className="resident__launch" onClick={() => navigate('/simulation')}>
                What happens if wildfire starts here?
              </button>
            </div>
          ) : (
            <p className="resident__hint">
              Pick an address to center the map on your location. Risk, evacuation
              route, and clearance time arrive in a later phase.
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
