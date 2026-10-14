# RESILIA

A hackathon prototype answering one question: **what happens if wildfire starts here?**
An interactive disaster digital twin that simulates ignition, spread, traffic,
evacuation, and emergency response around a chosen point in a demo city, then
lets you compare scenarios side by side.

The wildfire model is a **deterministic hackathon simulation** — same inputs
always produce the same outputs — not a production fire-prediction engine.
This is built for demo impact and decision-support storytelling, not
scientific accuracy.

## Setup

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
```

# Τι εμφανίζει ο χάρτης

Στον ψηφιακό δίδυμο (Digital Twin) του **RESILIA** εμφανίζονται τα εξής είδη πολυγώνων:

### 1. Διακεκομμένα γαλάζια/κυανά ορθογώνια/πολύγωνα
* **Τι είναι:** Τα **όρια των 4 γειτονιών** του Cedar Ridge:
  * **Ridgeline** (βορειοανατολικά, κοντά στο δάσος)
  * **Town Center** (κεντρικά/δυτικά)
  * **Lower Village** (κεντρικά)
  * **Creekside** (νότια)
* **Χρώμα/Στυλ:** Κυανή διακεκομμένη γραμμή (`#38bdf8`, dashed).
* **Σκοπός:** Οριοθετούν τις ζώνες πληθυσμού ώστε να υπολογίζεται πόσοι κάτοικοι και πόσα κτίρια ανά γειτονιά εκτίθενται στον κίνδυνο.

### 2. Σκουροπράσινα / πετρόλ πολύγωνα
* **Τι είναι:** Οι **ζώνες βλάστησης & καύσιμης ύλης (fuel zones)**:
  * **Ridgeline forest edge** (πυκνό δάσος ψηλά στο βουνό)
  * **Hollow Creek brushland** (θαμνώδης έκταση χαμηλά στο ρέμα)
* **Χρώμα/Στυλ:** Ημιδιαφανές πρασινομπλέ/πετρόλ γέμισμα με περίγραμμα.
* **Σκοπός:** Επιταχύνουν ντετερμινιστικά την ταχύτητα εξάπλωσης της φωτιάς όταν το μέτωπο περνάει μέσα από αυτά (λόγω υψηλής καύσιμης ύλης).

### 3. Πολύγωνα φωτιάς & καπνού (κατά την εξέλιξη του σεναρίου)
* **Έντονο πορτοκαλί / ember:** Το **ενεργό μέτωπο της φωτιάς** (active fire front) τη συγκεκριμένη χρονική στιγμή ($T+xx$).
* **Βαθύ σκούρο κόκκινο / καφέ:** Η **ήδη καμένη περιοχή** (burned area των προηγούμενων λεπτών).
* **Ημιδιαφανές γκρι πέπλο:** Το **νέφος καπνού (smoke plume)** που παρασύρεται από τον άνεμο και καλύπτει πολύ μεγαλύτερη έκταση από την ίδια τη φωτιά.

### 4. Λευκά / εκτοξευμένα (extruded) 3D πολύγωνα
* **Τι είναι:** Τα πραγματικά **3D κτίρια** της περιοχής (από τα vector tiles), με ρεαλιστικές σκιές στο έδαφος.

### 5. Ζώνες εκκένωσης, διάδρομοι & safe zones
* **Γειτονιές:** ημιδιαφανές γέμισμα ανά φάση εντολής (γαλάζιο advisory, κεχριμπαρί warning, ember evacuate, πράσινο cleared).
* **Πράσινο/κεχριμπαρί halo** γύρω από τους δρόμους που είναι ο ενεργός διάδρομος διαφυγής (amber όταν η διαδρομή είναι detour).
* **Κύκλοι safe zone:** Central Avenue Shelter, Cedar Ridge Elementary, South Perimeter Gate. Πράσινο όταν δέχονται κόσμο, κόκκινο όταν η εγκατάσταση δεν είναι πια ασφαλής.

### 6. Μονάδες έκτακτης ανάγκης (authority)
* **Τι είναι:** Engine 01, Engine 02, Ambulance 01 και Command Unit.
* **Χρώμα/Στυλ:** Μικρή ετικέτα πάνω στο χάρτη (E1, E2, A1, CMD). Πορτοκαλί/κεχριμπαρί για τις πυροσβεστικές, κόκκινο για το ασθενοφόρο, κυανό για τη διοίκηση.
* **Σκοπός:** Σε στάση κάθονται στον σταθμό τους. Μετά το Deploy ζωγραφίζεται η διαδρομή στο οδικό δίκτυο, ένας κύκλος στον προορισμό, και η μονάδα κινείται κατά μήκος της καθώς κυλάει το timeline.

---


## Κατάσταση έργου (state summary)

**Τρέχουσα έκδοση:** Phase 10 από τις 11 του πλάνου έχει ολοκληρωθεί και
επαληθευτεί (`npm run build` + `npm run lint` καθαρά, 0 σφάλματα).

**Τι δουλεύει σήμερα:**
- Landing screen με mock ρόλους (Resident / Authority), TopBar με τρέχοντα
  ρόλο και "switch role". Και οι δύο ρόλοι μπαίνουν κατευθείαν στο digital
  twin. Τα `/resident` και `/authority` ανακατευθύνουν στο `/simulation`.
- Στο twin, το μενού **Ignition** διαλέγει το σημείο έναρξης (δάσος ή μία από
  τις demo διευθύνσεις). Ο ρόλος Authority βλέπει επιπλέον την ανάπτυξη μονάδων
  και το **Save for Review**: αποθήκευση του τρέχοντος run στο `localStorage`,
  λίστα, επαναφορά, και **Compare** ανάμεσα σε δύο αποθηκευμένα runs
  (χάρτες δίπλα-δίπλα και delta metrics στο ίδιο λεπτό).
- Digital twin (`/simulation`): πραγματικά 3D κτίρια, δρόμοι, ζώνες
  βλάστησης, όρια γειτονιών, 5 κρίσιμες υποδομές, σημείο ανάφλεξης.
- Ντετερμινιστική προσομοίωση φωτιάς + καπνού: 7 frames (T+00 έως T+30),
  timeline με play/pause/step/reset + ταχύτητες 1x-10x, scenario panel.
- **Impact Analytics (Phase 5):**
  - KPI cards (εκτεθειμένος πληθυσμός, κτίρια σε κίνδυνο, επηρεαζόμενο οδικό
    δίκτυο, απειλή κρίσιμων εγκαταστάσεων, δυναμική μετώπου).
  - Expandable drawer με αναλυτική κατάσταση για όλες τις υποδομές (απόσταση
    σε μέτρα, badge κατάστασης), δρόμους (blocked/threatened/clear) και
    γειτονιές (ποσοστό έκθεσης πληθυσμού και κτιρίων).
  - Δυναμικός χρωματισμός οδικού δικτύου στο χάρτη ανάλογα με την κατάσταση
    (κόκκινο για blocked, πορτοκαλί για smoke hazard/threatened, κυανό για clear).
  - Alert badges & rich popups με πραγματική απόσταση για τις 5 κρίσιμες εγκαταστάσεις.
- **Evacuation (Phase 7):** phased orders ανά γειτονιά, clearance time που
  αλλάζει με τη φωτιά και το οδικό δίκτυο, safe zones (shelter, σχολείο,
  South Perimeter Gate) και προτεινόμενος διάδρομος με detour όταν κλείνει
  η κύρια διαδρομή. Ο χάρτης χρωματίζει τη φάση εντολής και τον διάδρομο.
  Ο κάτοικος βλέπει διαδρομή, safe zone και clearance για το incident στο T+15.
- **Emergency Response (Phase 8):** τέσσερις μονάδες (Engine 01, Engine 02,
  Ambulance 01, Command Unit) σταθμευμένες σε σταθμό, νοσοκομείο και καταφύγιο.
  Η αρχή επιλέγει μονάδα και στόχο (μέτωπο, γειτονιά, νοσοκομείο, ζώνη
  εκκένωσης, choke point), βλέπει διαδρομή στο οδικό δίκτυο και ETA, και η
  μονάδα κινείται με το timeline. Κλειστός δρόμος μένει στη διαδρομή μόνο αν
  δεν υπάρχει άλλη, και τότε το ETA μακραίνει.

**Βασικές αποφάσεις σχεδίασης:**
- Καμία πραγματική γεωκωδικοποίηση, backend, auth provider ή database —
  όλα ντετερμινιστικά και τοπικά (React state + `localStorage`).
- MapLibre GL αντί react-leaflet για πραγματική 3D
  προβολή κτιρίων· **OpenFreeMap** ως default tile source (δωρεάν, χωρίς
  API key)· προαιρετικό `VITE_MAPTILER_KEY` env var αν χρειαστεί ποτέ άλλο
  στυλ, όχι απαραίτητο.
- Μοντέλο φωτιάς: ακτίνα ανά γωνία γύρω από το σημείο ανάφλεξης (όχι grid) —
  μη ακτινωτό, οργανικό μέτωπο με ρεαλιστικές γλώσσες φωτιάς (αρμονικές Fibonacci),
  επηρεασμένο από ευθυγράμμιση ανέμου (ελλειπτικό L/W model), ανάγλυφο/κλίση
  εδάφους (επιτάχυνση ανηφόρας / επιβράδυνση κατηφόρας), ζώνες βλάστησης
  (δάσος/θάμνοι), ξηρασία και σοβαρότητα, χωρίς καμία τυχαιότητα (ίδιο σενάριο →
  ίδιο αποτέλεσμα πάντα).
- Καπνός: ξεχωριστό μοντέλο αερομεταφοράς και ατμοσφαιρικής διάχυσης με
  τυρβώδεις λοβούς, που πάντα υπερκαλύπτει τη φωτιά, με σημαντικά μεγαλύτερη
  εμβέλεια (2.5x-3.5x) προς τα κατάντι του ανέμου.
- Σκοτεινό "command-center" visual language (near-black βάση, ember/cyan
  accents), IBM Plex Mono για αριθμητικές τιμές/δεδομένα.

## Stack

React + TypeScript + Vite. Routing via `react-router-dom`. Map via
**MapLibre GL** (`maplibre-gl`) with OpenFreeMap vector tiles by default —
free, no API key. Charts via `recharts`. Icons via `lucide-react`. No
backend, no auth provider, no database — simulation state lives in React
state and `localStorage`.

## Structure

```
src/
  auth/                 mock AuthContext (resident | authority)
  components/layout/    Shell + TopBar (persistent header)
  components/map/       CityMap (MapLibre GL wrapper)
  components/scenario/  ScenarioPanel, SavedScenarios, CompareView
  components/response/  ResponsePanel
  components/timeline/  Timeline
  pages/                Login, Simulation
  simulation/           deterministic fire/smoke engine
  data/                 demoAddresses.ts, demoCity.ts
  hooks/                useSimulation
  utils/
```

## Phase log

- **Phase 0 — Foundation (done).** Vite/React/TS shell, dark command-center
  theme (CSS variables in `src/index.css`), routing for the four core
  screens, dependencies for later phases pre-installed. Build and lint are
  clean.
- **Phase 1 — Login & Roles (done).** `src/auth/AuthContext.tsx` holds the
  active role (`resident` | `authority`) in React state, persisted to
  `localStorage` — no real credentials. Picking a role on the landing
  screen shows a brief deterministic "Verifying access" transition, then
  routes both roles into the digital twin. `/resident` and `/authority`
  redirect to `/simulation`. The role still decides what the twin shows:
  the authority gets unit deployment, scenario save, and scenario comparison, the resident does not. The shell's
  TopBar shows the active role and a "Switch role" control that logs out
  and returns to landing.
- **Phase 2 — Resident Address (done).** `src/data/demoAddresses.ts` is a
  fixed lookup table (no real geocoding) placing the fictional town "Cedar
  Ridge" on real wildland-urban-interface terrain so the map reads as
  plausible. The twin's Ignition menu uses that list to place the fire.
- **Phase 3 — Digital Twin (done).** Map engine swapped from react-leaflet
  to **MapLibre GL** for real 3D building extrusion (`fill-extrusion` on
  the vector `building` layer) — Leaflet is 2D-only. Tiles default to
  **OpenFreeMap** (`https://tiles.openfreemap.org/styles/liberty`) — free,
  no API key, no rate limit. An optional `VITE_MAPTILER_KEY` env var
  (`.env.example`) swaps in MapTiler's dark style if ever wanted; nothing
  requires it. `src/data/demoCity.ts` adds the twin geography (roads,
  vegetation/fuel zones, neighborhood boundaries, 5 critical-infrastructure
  points, one ignition point) around the existing Cedar Ridge addresses.
  `CityMap`'s `showTwin` prop renders all of it as MapLibre GeoJSON layers;
  it's on by default on `/simulation`, which is where both roles land.
- **Phase 4 — Fire Simulation (done).** `src/simulation/` holds the pure,
  React-free engine: `fireModel.ts` computes a deterministic fire-radius
  and smoke-radius per compass angle (distance × wind alignment × dryness
  × severity, no randomness anywhere), `simulationEngine.ts` precomputes
  all 7 frames (T+00..T+30, 5-min steps) for a scenario in one pass, and
  `scenarios.ts` holds the default demo scenario (NE wind, high dryness,
  severe) plus the fixed timeline checkpoints. `useSimulation.ts` wraps it
  with play/pause/step/reset and a 1x/2x/5x/10x speed control; changing
  any scenario input restarts at T+00 since it's a new deterministic run.
  `CityMap` renders three live layers per frame: burned area (dark red,
  previous frame's ring), active fire front (bright ember, ring between
  previous and current radius, with a blurred glow line), and the smoke
  plume (translucent gray, always reaching at least as far as the fire).
  `ScenarioPanel` and `Timeline` components live on `/simulation`.
- **Phase 5 — Impact Analytics (done).** `src/simulation/impactModel.ts` computes
  pure, deterministic spatial impact analytics for every frame:
  - Distance (in meters) to active fire front and smoke plume for all coordinates.
  - Critical infrastructure threat tracking for 5 key facilities (`safe`, `alert`,
    `threatened`, `compromised`).
  - Road disruption status (`clear`, `smoke_hazard`, `threatened`, `blocked`).
  - Neighborhood demographics & exposure: population and building exposure
    modeled with vulnerability factors across the 4 neighborhoods (~4,240 residents,
    ~720 buildings).
  - Precalculated on each `SimulationFrame.impact` for instant timeline scrubbing.
  - `ImpactCards.tsx` provides high-density command-center KPI cards with
    threat badges and an expandable breakdown drawer for all facilities, roads,
    and neighborhoods.
  - `CityMap.tsx` dynamically colors affected roads (crimson red when blocked,
    amber when threatened, cyan when clear) and pulses alert states on threatened
    infrastructure markers with rich proximity popups.
  - The same cards and map are the twin on `/simulation`.

- **Phase 6 — Traffic & Congestion (done).** `src/simulation/trafficModel.ts` computes
  pure, deterministic evacuation traffic telemetry across all 5 Cedar Ridge corridors:
  - Vehicle surge schedule and network saturation modeled as neighborhoods enter evacuation status.
  - Road flow speeds (50 km/h down to 0 km/h) and congestion states (`free_flow`, `moderate`,
    `heavy`, `standstill`, `closed`).
  - Active choke point / bottleneck detection at critical feeder junctions.
  - Outbound evacuation throughput (vehicles/min) reaching the safe perimeter.
  - `CityMap.tsx` features animated vehicle pulses (`traffic-pulses` layer) streaming along
    open escape arteries at live corridor speeds, road line casing, dynamic congestion-based
    coloring (cyan → amber → crimson), pulsing bottleneck beacons (`choke-points`), and
    interactive road click inspection popups.
  - `ImpactCards.tsx` enriched with live network speed, active bottleneck counters, and
    corridor saturation meters in the breakdown drawer.
  - Operational readout updated on `Simulation.tsx`.

- **Phase 7 — Evacuation (done).** `src/simulation/evacuationModel.ts` advances a
  deterministic evacuation on top of each frame's impact and traffic:
  - Four phased orders (Ridgeline, Lower Village, Creekside, Town Center). Severe,
    dry, and high-wind scenarios pull the order clock earlier.
  - Residents leave only after the warning window opens. Progress accumulates
    forward across frames, so a later traffic jam slows the rate without
    sending people back home.
  - Clearance time is how long the neighborhoods that can still move need.
    A closed corridor strands whoever is left on it and is reported separately;
    that stranded time becomes the city number only when every remaining route is closed.
  - Each neighborhood has a primary safe zone and corridor, then a fallback when
    that shelter is threatened or the road is blocked (detour to the South Perimeter
    Gate along Hollow Creek Lane).
  - `CityMap` paints neighborhood phase fills, a corridor halo on the recommended
    roads, and safe-zone markers. `ImpactCards` and the twin map read the same frame metrics.

- **Phase 8 — Emergency Response (done).** `src/data/emergencyUnits.ts` stations
  four units: Engine 01 and Engine 02 at Fire Station 4, Ambulance 01 at
  Ridgeline Medical Center, Command Unit at Central Avenue Shelter.
  `src/simulation/responseModel.ts` routes a dispatch along the existing road
  graph (no external router). Speed follows the corridor's congestion, and a
  closed road is used only when every open path is gone — that dispatch is
  marked and the ETA gets longer. The authority panel on `/simulation` chooses
  a unit and a target (fire front, neighborhood, hospital, evacuation zone, or
  choke point). The map draws the route immediately; play, pause, and scrub
  move the unit and count the ETA down. Recall sends it back to station.
  Changing the scenario clears assignments.

- **Phase 9 — Scenario Save (done).** The authority opens **Save for Review**
  on the twin. A saved run stores its name, time, ignition, wind parameters,
  playhead, dispatches, the metrics at that minute, and a result reference.
  The frames are not stored: opening the row recomputes the same deterministic
  run. The list lives in `localStorage` (`resilia.savedScenarios`) and is still
  there after a refresh. Remove drops one entry.

- **Phase 10 — Scenario Comparison (done).** From the saved list the authority
  marks one run **A** and another **B**, then presses **Compare**. Both maps
  use the same camera and the same minute, from **T+00** to **T+60**. The
  table shows affected area, exposed residents, buildings at risk, clearance,
  blocked roads, bottlenecks, units in the field, and critical facilities,
  with the change from A to B. A larger harmful number is marked on that row.
  The frames are recomputed from the saved inputs.

## Known limitations

- No real geocoding, GIS, ML, or emergency-service integration — everything
  is local, deterministic demo data by design.

## Change Log

### 2026-10-14 — Compare two saved runs

- The authority can mark two saved runs as A and B and open them side by side. Both maps share a camera and a minute, and the table shows how far B moves from A.

### 2026-10-14 — Save a run for review

- The authority can name the current twin run and keep it in this browser. Opening it again restores the ignition, the wind, the minute, and any dispatches. The list survives a page refresh.

### 2026-10-14 — Emergency units, routes, and ETA

- Authority can deploy Engine 01, Engine 02, Ambulance 01, or the Command Unit onto the road network. The twin draws the route and destination, shows an ETA, and moves the unit with the timeline.

### 2026-10-12 — Road network follows the basemap

- The five Cedar Ridge corridors in `src/data/demoCity.ts` now trace the real street centerlines on the map (Piuma Road, Cold Canyon Road, Malibu Canyon Road, and Crater Camp Drive) instead of straight chords across the terrain. Traffic color, vehicle pulses, and bottleneck markers sit on those streets. The ignition point sits on the ridgeline forest edge beside Cold Canyon so the fire still reaches the ridge road.

### 2026-10-12 — Evacuation orders and clearance

- Added a deterministic evacuation model: phased neighborhood orders, clearance time, safe zones, and fallback corridors that respond to fire threat and road congestion.
- The digital twin now shows order phase on each neighborhood, the active escape corridor, and whether a shelter is still receiving people.