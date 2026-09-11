# RESILIA

A hackathon prototype answering one question: **what happens if wildfire starts here?**
An interactive disaster digital twin that simulates ignition, spread, traffic,
evacuation, and emergency response around a chosen point in a demo city, then
lets you compare scenarios side by side.

The wildfire model is a **deterministic hackathon simulation** — same inputs
always produce the same outputs — not a production fire-prediction engine.
This is built for demo impact and decision-support storytelling, not
scientific accuracy.

## Stack

React + TypeScript + Vite. Routing via `react-router-dom`. Map via
`react-leaflet` / `leaflet` (added now, wired up in Phase 3). Charts via
`recharts`. Icons via `lucide-react`. No backend, no auth provider, no
database — simulation state lives in React state and `localStorage`.

## Structure

```
src/
  components/layout/   Shell + TopBar (persistent header)
  pages/                Login, Resident, Authority, Simulation
  simulation/           deterministic engine (Phase 4+)
  data/                 demo city/population/roads/infra dataset (Phase 3+)
  hooks/                useSimulation etc. (Phase 4+)
  utils/
```

## Setup

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
```

## Phase log

- **Phase 0 — Foundation (done).** Vite/React/TS shell, dark command-center
  theme (CSS variables in `src/index.css`), routing for the four core
  screens, dependencies for later phases pre-installed. Build and lint are
  clean. `/` shows the landing screen with Resident / Authority entry
  points; the other three routes are placeholders pending their phases.

Next: **Phase 1 — Login & Roles** (mock role selection, no real auth).

## Known limitations

- No real geocoding, GIS, ML, or emergency-service integration — everything
  is local, deterministic demo data by design.
- Placeholder routes (`/resident`, `/authority`, `/simulation`) have no
  functionality yet; they exist so routing and the shared shell are proven
  out before feature work begins.
