# Walkthrough — Phase 5: Impact Analytics

RESILIA now features full deterministic impact analytics across population exposure, buildings at risk, road network disruption, and critical infrastructure threat tracking.

### 1. Demographics & Infrastructure Data
- Updated [`src/data/demoCity.ts`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/data/demoCity.ts) to enrich all 4 Cedar Ridge neighborhoods with population (~4,240 residents total), building counts (~720 total buildings), and vulnerability weightings.

### 2. Pure Deterministic Impact Engine
- Created [`src/simulation/impactModel.ts`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/simulation/impactModel.ts):
  - `evaluatePointAgainstFire()`: Computes real-time radial distance in meters to active fire front and detects smoke plume engulfment.
  - `evaluateInfrastructure()`: Classifies all 5 facilities into `safe`, `alert`, `threatened`, or `compromised` states with exact meter proximities.
  - `evaluateRoads()`: Samples routes across vertices and midpoints to identify `blocked`, `threatened`, and `smoke_hazard` conditions.
  - `evaluateNeighborhoods()`: Computes deterministic population exposure and buildings at risk.
  - `computeImpactMetrics()`: Produces `ImpactMetrics` containing total exposure, high-risk counts, perimeter length in km, and rate of spread.

### 3. Simulation Pipeline Integration
- Updated [`src/simulation/simulationTypes.ts`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/simulation/simulationTypes.ts) and [`src/simulation/simulationEngine.ts`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/simulation/simulationEngine.ts) so that each frame precomputes its `impact: ImpactMetrics`. Timeline scrubbing and playback have zero recalculation latency.

### 4. Command Center KPI Cards & Impact Inspector
- Built [`src/components/metrics/ImpactCards.tsx`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/components/metrics/ImpactCards.tsx) and [`src/components/metrics/ImpactCards.css`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/components/metrics/ImpactCards.css):
  - **Exposed Residents Card**: Live population affected with critical risk badges.
  - **Buildings at Risk Card**: Total threatened structures and severe perimeter count.
  - **Road Network Card**: Blocked vs degraded route counters.
  - **Critical Facilities Card**: Active alert indicator with nearest facility name and meter proximity.
  - **Fire Dynamics Card**: Hectares burned, perimeter (km), and rate of spread (m/min).
  - **Expandable Inspector**: Full breakdown tables for facilities, roads, and neighborhood exposure bars.

### 5. Dynamic Map Reactions
- Updated [`src/components/map/CityMap.tsx`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/components/map/CityMap.tsx) and [`src/components/map/CityMap.css`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/components/map/CityMap.css):
  - Roads dynamically update color: **crimson red** when blocked (`#e2483f`), **amber** when threatened (`#e0a83d`), and **cyan** when clear (`#00c3e6`).
  - Critical infrastructure markers display animated danger auras when threatened or compromised and feature rich interactive popups with real-time meter proximity.

### 6. Authority & Resident Screen Enhancements
- **Authority Dashboard ([`src/pages/Authority/Authority.tsx`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/pages/Authority/Authority.tsx)):** Transformed into a command center briefing with live incident KPI metrics, situational map snapshot, and direct launch into the digital twin.
- **Resident View ([`src/pages/Resident/Resident.tsx`](file:///f:/_SEAGATE_HD/PYTHON/RESILIA/src/pages/Resident/Resident.tsx)):** When an address is selected, calculates and shows the resident's personal threat level, wildfire proximity in meters, and air quality exposure.

---


