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

## Κατάσταση έργου (state summary)

**Τρέχουσα έκδοση:** Phase 4 από τις 11 του πλάνου έχει ολοκληρωθεί και
επαληθευτεί (`npm run build` + `npm run lint` καθαρά, 0 σφάλματα).

**Τι δουλεύει σήμερα:**
- Landing screen με mock ρόλους (Resident / Authority), route guard, TopBar
  με τρέχοντα ρόλο και "switch role".
- Resident: επιλογή διεύθυνσης από fixed demo λίστα (Cedar Ridge) → εστίαση
  χάρτη + κουμπί εισόδου στο digital twin.
- Digital twin (`/simulation`): πραγματικά 3D κτίρια, δρόμοι, ζώνες
  βλάστησης, όρια γειτονιών, 5 κρίσιμες υποδομές, σημείο ανάφλεξης.
- Ντετερμινιστική προσομοίωση φωτιάς + καπνού: 7 frames (T+00 έως T+30),
  timeline με play/pause/step/reset + ταχύτητες 1x-10x, scenario panel
  (κατεύθυνση/ένταση ανέμου, ξηρασία, σοβαρότητα).

**Βασικές αποφάσεις σχεδίασης:**
- Καμία πραγματική γεωκωδικοποίηση, backend, auth provider ή database —
  όλα ντετερμινιστικά και τοπικά (React state + `localStorage`).
- MapLibre GL αντί react-leaflet (αλλαγή στη Phase 3) για πραγματική 3D
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

**Τι μένει (Phases 5-11):**
- **Phase 5 — Impact Analytics:** εκτεθειμένοι κάτοικοι, κτίρια σε κίνδυνο,
  επηρεαζόμενοι δρόμοι, κρίσιμες υποδομές, KPI cards.
- **Phase 6 — Traffic:** ζητήθηκε animated χρωματισμός διαδρομών (μπλε όταν
  ok, κόκκινο όταν όχι) — βλ. σημείωση παρακάτω με το reference video.
- **Phase 7 — Evacuation:** ζώνες/πρόοδος εκκένωσης, εκτιμώμενος χρόνος
  εκκαθάρισης, ασφαλείς διαδρομές.
- **Phase 8 — Emergency Response:** ανάθεση/κίνηση μονάδων έκτακτης ανάγκης.
- **Phase 9 — Scenario Save:** αποθήκευση/επαναφόρτωση σεναρίων σε
  `localStorage`.
- **Phase 10 — Scenario Comparison:** σύγκριση A/B σεναρίων με delta metrics.
- **Phase 11 — Polish:** animations, loading/empty states, demo mode,
  responsive πολιτούρα.

## Stack

React + TypeScript + Vite. Routing via `react-router-dom`. Map via
**MapLibre GL** (`maplibre-gl`) with OpenFreeMap vector tiles by default —
free, no API key. Charts via `recharts`. Icons via `lucide-react`. No
backend, no auth provider, no database — simulation state lives in React
state and `localStorage`.

## Structure

```
src/
  auth/                 mock AuthContext + RequireRole guard
  components/layout/    Shell + TopBar (persistent header)
  components/map/       CityMap (MapLibre GL wrapper)
  components/scenario/  ScenarioPanel
  components/timeline/  Timeline
  pages/                Login, Resident, Authority, Simulation
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
  routes to the matching dashboard. `RequireRole` guards `/resident` and
  `/authority`, bouncing to `/` if the role doesn't match. The shell's
  TopBar shows the active role and a "Switch role" control that logs out
  and returns to landing.
- **Phase 2 — Resident Address (done).** `src/data/demoAddresses.ts` is a
  fixed lookup table (no real geocoding) placing the fictional town "Cedar
  Ridge" on real wildland-urban-interface terrain so the map reads as
  plausible. The Resident page's address picker confirms the location and
  focuses the map on it.
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
  it's on by default on the new `/simulation` route, which both the
  Resident ("What happens if wildfire starts here?" button, shown once an
  address is confirmed) and Authority ("View digital twin" button) pages
  link into.
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

Next: **Phase 5 — Impact Analytics** (exposed residents, buildings at
risk, roads affected, critical-infrastructure threat, KPI cards).

## Design notes for later phases

- **Phase 6 (traffic):** the person wants animated route lines that shift
  color by status (blue when OK, red when degraded) along the line, in the
  style of https://www.youtube.com/watch?v=WbJ4OrFpr38 — revisit that link
  when starting Phase 6.

## Known limitations

- No real geocoding, GIS, ML, or emergency-service integration — everything
  is local, deterministic demo data by design.
- No traffic, evacuation, emergency-response, scenario save/compare, or
  KPI analytics yet — that's Phases 5-10.