# RESILIA — MASTER IMPLEMENTATION PROMPT

You are the lead engineer building **RESILIA**, a hackathon-ready SaaS prototype for **Disaster-Resilient Smart City Management**.

## 1. Product Vision

RESILIA is an interactive **AI-ready disaster digital twin and what-if simulation platform**.

Its core question is:

> **“What happens if a wildfire starts here?”**

A user selects or enters an address. RESILIA creates a deterministic simulated emergency scenario around that location and shows how the disaster evolves through time.

The goal is NOT to build a scientifically accurate wildfire prediction system.

The goal is to create a **highly convincing, visually impressive, deterministic decision-support demo** showing how a city could simulate disaster scenarios before they happen.

The application must feel like a serious emergency-management SaaS product, not like a game or a toy simulation.

The hackathon demo should communicate:

**Location → Ignition → Simulation → Impact → Evacuation → Response → Scenario comparison → Decision**

---

# 2. Critical Hackathon Principle

Prioritize **demo impact over technical complexity**.

Everything must be deterministic and locally simulated.

Do NOT introduce:

* real wildfire APIs
* real emergency services
* real-time GIS infrastructure
* backend infrastructure unless absolutely necessary
* machine-learning models
* complex physical fire models
* authentication providers
* payment systems
* unnecessary cloud services

The hackathon prototype must run reliably from a laptop.

Use **simulated/deterministic data**.

The simulation should LOOK sophisticated even though the underlying model is intentionally simplified.

Be transparent in the UI where appropriate that this is a **simulation / scenario model**, not a real emergency prediction system.

---

# 3. Technology

Build the project as a modern **ReactJS web application**.

Preferred stack:

* React
* TypeScript
* Vite
* CSS or lightweight styling solution
* Leaflet / React-Leaflet OR another lightweight map solution if already available
* Recharts or lightweight charting if needed
* Lucide React or another minimal icon library

Keep dependencies minimal.

Do NOT introduce Redux, Zustand, complex state-management frameworks, backend frameworks, databases or authentication platforms unless explicitly requested later.

Use local deterministic data and React state.

---

# 4. Engineering Rules

The uploaded `AGENT.md` is the engineering authority.

Follow its principles:

* Think before coding.
* State assumptions before non-trivial implementation.
* Do not invent requirements.
* Prefer the simplest implementation.
* Make surgical changes.
* Do not build future features prematurely.
* Define measurable acceptance criteria.
* Verify the implementation.
* Keep README.md updated when the change is significant.

Although the provided AGENT.md was originally written for a Flutter project, **adapt its engineering principles to React/TypeScript**.

Do NOT blindly copy its Flutter-specific architecture.

The equivalent React principles are:

* small modular components
* simple state management
* feature-oriented organization
* no premature abstractions
* no unnecessary providers/managers/services
* incremental implementation
* explicit verification

Before each implementation phase:

1. Understand
2. Inspect
3. Plan
4. Implement
5. Verify
6. Report

---

# 5. Product Roles

RESILIA has two conceptual roles.

## End User

The citizen / resident enters the system and asks:

> What happens if wildfire starts here?

The user provides:

* address
* optional scenario parameters

The system then shows the simulated consequences around that location.

## Admin / Authority

The authority dashboard represents:

* municipality
* civil protection
* emergency management
* fire department
* city operations center

The authority can inspect:

* affected areas
* evacuation clearance
* traffic
* bottlenecks
* exposed population
* critical infrastructure
* emergency vehicle deployment
* scenario comparisons

For the hackathon, authentication can be **mocked**.

Do NOT implement real authentication.

Create visually convincing login flows with:

* Resident / End User
* Authority / Admin

Use deterministic demo credentials or simple role selection.

---

# 6. Core UX

The primary experience must be:

### Step 1

User opens RESILIA.

### Step 2

Login.

Two options:

**Resident**

**Authority**

### Step 3

Resident enters an address.

Example:

> 123 Example Street

The application geocodes against the deterministic demo dataset rather than requiring a real geocoding backend.

### Step 4

System displays:

> **What happens if wildfire starts here?**

The selected location becomes the ignition point.

### Step 5

User launches simulation.

Show a short, polished transition:

> Initializing digital twin...

Then:

> Simulating wildfire propagation...

Then:

> Scenario ready.

### Step 6

The digital twin appears.

The user sees:

* city / neighborhood
* roads
* buildings
* vegetation
* ignition point
* fire perimeter
* affected zones
* evacuation routes
* emergency vehicles
* population exposure

### Step 7

The user can advance time.

Example:

**T+00 min**

**T+05 min**

**T+10 min**

**T+15 min**

**T+20 min**

**T+30 min**

Use deterministic simulation frames.

---

# 7. Digital Twin Visualization

The central UI should be a large interactive map.

The map is the most important component of the product.

It should visually communicate:

* terrain / urban area
* roads
* buildings
* vegetation
* fire
* smoke / hazard zones
* evacuation routes
* emergency units
* safe zones
* population exposure

Avoid excessive visual clutter.

The map should feel like an emergency operations interface.

Use a dark professional command-center visual language.

Think:

**Palantir / emergency operations center / modern digital twin**

not:

**Google Maps clone / consumer navigation app / video game HUD**

---

# 8. Deterministic Simulation Engine

Create a small, isolated simulation engine.

Suggested structure:

```text
src/
  simulation/
    fireModel.ts
    scenarios.ts
    simulationTypes.ts
    simulationEngine.ts
```

The engine must be independent from React UI.

The simulation receives:

```ts
SimulationInput
```

containing:

* ignition point
* wind direction
* wind speed
* dryness
* time horizon
* scenario parameters

and produces deterministic:

```ts
SimulationFrame[]
```

Each frame contains:

* simulation time
* fire perimeter
* affected cells/zones
* buildings at risk
* residents exposed
* roads affected
* traffic congestion
* evacuation clearance estimate
* emergency vehicle positions
* critical choke points

---

# 9. Fire Spread Model

Use a simple deterministic cellular/grid or zone-based model.

DO NOT attempt real physics.

The model can use:

* distance from ignition
* wind direction
* wind intensity
* vegetation/fuel factor
* terrain/slope factor
* deterministic propagation rules

Example conceptual rule:

```text
spreadScore =
    baseSpread
    + windInfluence
    + fuelInfluence
    + slopeInfluence
```

A zone becomes affected when the deterministic threshold is exceeded.

The important requirement is:

**Same input → same simulation result.**

Do NOT use uncontrolled randomness.

If randomness is desired, use a seeded deterministic pseudo-random generator.

---

# 10. Simulation Time

The simulation must support manual time advancement.

Controls:

```text
|◀ Previous
|◀ Step
▶ Play
▶| Next
Reset
```

Also provide:

**Simulation Speed**

* 1x
* 2x
* 5x
* 10x

The primary hackathon interaction should be:

> **Advance Time**

The audience should clearly see the city changing as the fire progresses.

---

# 11. Key Metrics

At every simulation step calculate/display:

### Fire

* Fire area
* Fire perimeter
* Spread rate
* Time since ignition

### Population

* Residents exposed
* Residents at high risk
* Residents evacuated
* Residents remaining in affected zones

### Buildings

* Buildings at risk
* Buildings severely threatened
* Critical buildings at risk

### Roads

* Roads blocked
* Roads congested
* Critical choke points

### Evacuation

* Estimated evacuation clearance time
* Current evacuation progress
* Safe routes available
* Routes becoming unavailable

### Emergency Response

* Active emergency vehicles
* Vehicles deployed
* Response time
* Units approaching critical zones

---

# 12. UI Layout

Build the main simulation screen around this hierarchy:

```text
┌──────────────────────────────────────────────────────────────┐
│ RESILIA                         Scenario     T+15:00   ● LIVE│
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  SCENARIO    │                                               │
│  PARAMETERS  │                  DIGITAL TWIN                 │
│              │                                               │
│  Wind        │                    MAP                        │
│  Dryness     │                                               │
│  Severity    │                                               │
│              │                                               │
│  ──────────  │                                               │
│              │                                               │
│  IMPACT      │                                               │
│  Residents   │                                               │
│  Buildings   │                                               │
│  Roads       │                                               │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Timeline                                                     │
│ 00 ─── 05 ─── 10 ─── 15 ─── 20 ─── 30 min                  │
├──────────────────────────────────────────────────────────────┤
│ Evacuation     Traffic       Exposure       Response         │
└──────────────────────────────────────────────────────────────┘
```

Adapt the exact layout as needed after implementation.

The map must dominate the screen.

---

# 13. Scenario Controls

Provide a compact scenario control panel.

Parameters:

### Ignition

* address
* ignition point

### Weather

* wind direction
* wind speed
* dryness

### Scenario severity

* Low
* Moderate
* Severe

Do not expose excessive technical parameters.

The interface is for decision makers, not fire-model researchers.

---

# 14. Scenario Comparison

This is a major hackathon feature.

Implement:

## COMPARE SCENARIOS

The user can save the current scenario.

Example:

**Scenario A — Current Conditions**

Then modify:

* wind
* dryness
* ignition point
* response strategy

and run again.

Save:

**Scenario B — North Wind**

Then click:

> COMPARE

Show side-by-side or overlaid results.

Compare:

* affected area
* exposed residents
* buildings at risk
* evacuation clearance
* blocked roads
* bottlenecks
* emergency response
* critical zones

Highlight the difference.

Example:

```text
                 Scenario A     Scenario B

Exposed residents     2,840         4,210   ▲ 48%
Buildings at risk       420           610   ▲ 45%
Clearance time        18 min        27 min  ▲ 50%
Blocked roads            7             11   ▲ 57%
```

This feature should be visually impressive.

---

# 15. Save Scenario for Review

Implement:

> **SAVE FOR REVIEW**

A saved scenario should contain:

* scenario name
* timestamp
* ignition point
* parameters
* key metrics
* simulation result reference

For the prototype, persistence can use:

```text
localStorage
```

No backend required.

Create a simple:

**Saved Scenarios**

drawer/modal.

The authority can reopen a scenario and compare it.

---

# 16. Traffic Simulation

Traffic does not need to be physically accurate.

Create deterministic traffic flows along the simulated road network.

Represent vehicles as small moving markers.

As roads become threatened:

* traffic density increases
* routes become congested
* roads may become blocked

Calculate:

```text
trafficLevel =
normal
→ heavy
→ congested
→ blocked
```

Visualize congestion directly on roads.

This should create a strong visual relationship:

**Fire expands → road closes → traffic reroutes → bottleneck appears.**

---

# 17. Bottleneck Detection

Implement deterministic bottleneck detection.

A bottleneck occurs when:

* an evacuation route carries excessive traffic
* an alternative route is blocked
* road capacity is insufficient
* multiple neighborhoods converge onto one road

Show critical bottlenecks as highlighted markers.

Clicking a bottleneck should display:

```text
CRITICAL CHOKE POINT

Route: Main Avenue
Traffic: 92%
Capacity: 100%
Evacuation impact: HIGH

Estimated delay: +11 min
```

This is a high-value authority feature.

---

# 18. Evacuation Simulation

Create a simplified evacuation model.

Each neighborhood contains:

```text
population
evacuationRate
nearestSafeZone
availableRoutes
```

As fire approaches:

1. neighborhood enters warning zone
2. evacuation starts
3. residents enter road network
4. traffic increases
5. roads may become blocked
6. clearance time changes

Display:

> **Estimated clearance time: 23 min**

This number must dynamically respond to the simulated scenario.

---

# 19. Emergency Vehicle Deployment

Create deterministic emergency units:

```text
Fire Engine 01
Fire Engine 02
Ambulance 01
Command Unit
```

Display them on the map.

The authority can select:

> **DEPLOY UNIT**

Then select a target:

* fire front
* neighborhood
* hospital
* evacuation zone
* choke point

The unit moves along the road network.

Display:

* route
* ETA
* destination
* status

Example:

```text
ENGINE 01
→ Critical Choke Point
ETA 04:32
Status: DEPLOYED
```

This does not need a sophisticated pathfinding algorithm.

A deterministic predefined route/network is sufficient.

---

# 20. Critical Infrastructure

Add a small number of deterministic critical locations:

* hospital
* school
* fire station
* power substation
* evacuation shelter

When threatened, visually highlight them.

Example:

```text
⚠ HOSPITAL AT RISK
Fire proximity: 1.2 km
Evacuation route: AVAILABLE
```

This makes the simulation much more meaningful than simply showing fire spread.

---

# 21. Resident View

The Resident experience must be much simpler.

After entering an address, show:

```text
YOUR LOCATION

Risk: HIGH

Wildfire proximity:
1.8 km

Estimated impact:
12–18 minutes

Recommended evacuation route:
Route A

Nearest safe zone:
Central School

Estimated clearance:
14 minutes
```

The resident should NOT see the full authority dashboard.

The UX should answer:

> **“What does this mean for me?”**

---

# 22. Authority Dashboard

The Admin / Authority view should answer:

> **“What should we do?”**

Show:

* active incidents
* scenario overview
* exposed residents
* threatened buildings
* blocked roads
* bottlenecks
* evacuation clearance
* emergency units
* critical infrastructure
* scenario comparison

Include a compact KPI strip:

```text
2,840 Residents Exposed
420 Buildings at Risk
7 Roads Blocked
23 min Clearance
4 Critical Choke Points
6 Emergency Units
```

---

# 23. Demo Dataset

Create one polished deterministic demo city.

Do NOT depend on external data.

The dataset should contain:

### Geography

* city boundary
* neighborhoods
* roads
* vegetation areas
* buildings

### Population

Each neighborhood gets:

* population
* vulnerability factor
* evacuation rate

### Infrastructure

* hospital
* school
* fire station
* shelter
* power facility

### Emergency network

* fire engines
* ambulances
* command unit

The dataset should be visually plausible.

Use a fictional or clearly simulated location if necessary.

---

# 24. Demo Scenario

Create a predefined "hero scenario".

When the hackathon judges open the application, there should be a one-click path to:

> **RUN DEMO SCENARIO**

Scenario:

```text
Wildfire ignition:
forest edge

Wind:
North-East

Dryness:
High

Severity:
Severe
```

The simulation should produce an obvious progression.

### T+00

Small ignition.

### T+05

Fire expands toward first neighborhood.

### T+10

Road begins experiencing congestion.

### T+15

First neighborhood enters evacuation zone.

### T+20

Major road becomes blocked.

Traffic reroutes.

A critical choke point appears.

### T+25

Hospital / infrastructure becomes threatened.

### T+30

Large evacuation impact.

The audience should be able to visually understand the chain reaction.

---

# 25. Hackathon Demo Sequence

Optimize the product around this 3–5 minute demonstration.

## Scene 1 — The Question

Show:

> **What happens if wildfire starts here?**

Enter/select an address.

---

## Scene 2 — Ignite

Click:

> SIMULATE

The map comes alive.

---

## Scene 3 — Time

Advance:

> T+05 → T+10 → T+15

Show fire growth.

---

## Scene 4 — Consequences

Show:

* exposed residents
* threatened buildings
* traffic
* bottlenecks

---

## Scene 5 — Evacuation

Advance time.

A road becomes blocked.

Evacuation clearance time increases.

---

## Scene 6 — Intervention

Authority deploys an emergency vehicle.

Show its route and ETA.

---

## Scene 7 — What-if

Save:

> Scenario A — Current Conditions

Change wind.

Run again.

Save:

> Scenario B — Stronger NE Wind

---

## Scene 8 — Compare

Click:

> COMPARE SCENARIOS

Show:

> Scenario B exposes 48% more residents and increases evacuation clearance by 9 minutes.

This should be the "wow" moment.

---

# 26. Visual Design

The product must look like a serious SaaS.

Use:

* dark command-center interface
* restrained typography
* strong information hierarchy
* high-quality cards
* subtle borders
* clear status indicators
* professional map overlays
* smooth transitions
* minimal animations
* no excessive gradients
* no gaming UI

Suggested visual language:

```text
Background: near-black / dark navy
Panels: dark elevated surfaces
Primary accent: emergency orange/red
Secondary: cyan/blue
Success: green
Warning: amber
Critical: red
```

Do not overuse red.

Red should mean danger.

---

# 27. Component Architecture

Keep architecture small.

Suggested structure:

```text
src/
  components/
    layout/
    map/
    metrics/
    timeline/
    scenario/
    evacuation/
    traffic/
    response/
    comparison/

  pages/
    Login/
    Resident/
    Authority/
    Simulation/

  simulation/
    simulationEngine.ts
    fireModel.ts
    trafficModel.ts
    evacuationModel.ts
    responseModel.ts
    scenarios.ts
    simulationTypes.ts

  data/
    demoCity.ts
    demoPopulation.ts
    demoInfrastructure.ts
    demoRoads.ts

  hooks/
    useSimulation.ts

  utils/

  App.tsx
  main.tsx
```

Do NOT create every folder immediately.

Create only what is required for the current implementation phase.

---

# 28. State Management

Use React state and custom hooks.

Do NOT introduce Redux or another global state manager.

The simulation state should conceptually be:

```ts
SimulationState {
  scenario
  currentTime
  frames
  currentFrame
  isRunning
  isPaused
  savedScenarios
}
```

Keep simulation calculations outside React components.

---

# 29. Data Model

Use explicit TypeScript types.

Examples:

```ts
type Point = {
  lat: number
  lng: number
}

type Neighborhood = {
  id: string
  name: string
  population: number
  vulnerability: number
  evacuationRate: number
}

type Road = {
  id: string
  name: string
  capacity: number
  points: Point[]
}

type Infrastructure = {
  id: string
  type: 'hospital' | 'school' | 'fireStation' | 'shelter' | 'power'
  location: Point
}

type EmergencyUnit = {
  id: string
  type: 'fireEngine' | 'ambulance' | 'command'
  location: Point
  status: string
}
```

Keep the models simple.

---

# 30. Address Search

The initial implementation should not require real geocoding.

Create deterministic demo addresses.

Example:

```text
12 Pine Street
45 Mountain Road
8 Central Avenue
```

Selecting an address resolves to a known demo location.

However, structure the code so that a real geocoding provider could be introduced later.

Do NOT implement that provider now.

---

# 31. Important UX Principle

The user must always understand:

### WHERE

Where is the disaster?

### WHEN

What happens next?

### WHO

Who is affected?

### WHAT

What infrastructure is threatened?

### HOW FAST

How quickly does the situation deteriorate?

### WHAT IF

What happens if conditions change?

### WHAT SHOULD WE DO

Where should emergency resources be deployed?

These questions should drive the entire UI.

---

# 32. Progressive Implementation Plan

Implement the application **feature-by-feature**.

Do NOT attempt the entire product in one step.

## PHASE 0 — Foundation

Create:

* React + TypeScript + Vite
* basic application shell
* routing
* visual theme
* README
* demo data structure

Acceptance:

* application launches
* no console errors
* clean responsive shell

---

## PHASE 1 — Login & Roles

Implement:

* landing/login screen
* Resident login
* Authority login
* mock role selection

Acceptance:

* both roles can enter
* correct dashboard opens
* no real authentication required

---

## PHASE 2 — Resident Address

Implement:

* address input
* deterministic address lookup
* selected location
* map focus

Acceptance:

Entering a demo address clearly identifies the location on the map.

---

## PHASE 3 — Digital Twin

Implement:

* map
* roads
* buildings
* neighborhoods
* vegetation
* ignition point

Acceptance:

The map looks like a coherent city digital twin.

---

## PHASE 4 — Fire Simulation

Implement:

* ignition
* deterministic spread
* simulation frames
* timeline
* play/pause
* manual time advancement

Acceptance:

The fire visibly propagates differently across time.

---

## PHASE 5 — Impact Analytics

Implement:

* exposed residents
* buildings at risk
* roads affected
* critical infrastructure
* KPI cards

Acceptance:

Metrics change as simulation time advances.

---

## PHASE 6 — Traffic

Implement:

* traffic visualization
* congestion
* blocked roads
* rerouting
* deterministic bottlenecks

Acceptance:

Fire progression creates visible traffic consequences.

---

## PHASE 7 — Evacuation

Implement:

* evacuation zones
* evacuation progress
* clearance time
* safe zones
* evacuation routes

Acceptance:

Clearance time changes according to fire and road conditions.

---

## PHASE 8 — Emergency Response

Implement:

* emergency units
* deployment
* route
* ETA
* target selection

Acceptance:

Authority can deploy a unit and visually see the result.

---

## PHASE 9 — Scenario Save

Implement:

* Save for Review
* saved scenario list
* scenario reload

Use localStorage.

Acceptance:

A scenario survives page refresh.

---

## PHASE 10 — Scenario Comparison

Implement:

* scenario A
* scenario B
* side-by-side comparison
* delta metrics
* visual map comparison

Acceptance:

The difference between scenarios is immediately understandable.

---

# 33. Demo Mode

Create a highly polished:

> **RUN DEMO**

button.

It should automatically:

1. load hero scenario
2. set ignition
3. start simulation
4. progress through predefined time points
5. reveal impact
6. show traffic
7. show evacuation
8. show bottleneck
9. show emergency response
10. stop at the comparison-ready state

The demo must also be manually controllable.

---

# 34. Important: Avoid Fake AI

Do not add an "AI" label just for marketing.

The first prototype is fundamentally:

**Digital Twin + Deterministic Simulation + Decision Support**

If an AI feature is later added, it should have a clear purpose, for example:

> AI Scenario Analyst

which could summarize:

* what changed
* why the scenario is worse
* which neighborhood is most vulnerable
* which intervention has the highest impact

But this should NOT block the initial implementation.

---

# 35. Safety / Positioning

The application is a hackathon simulation prototype.

Do not present simulated outputs as real emergency predictions.

Use appropriate wording such as:

> SIMULATED SCENARIO

and:

> Results are illustrative and based on deterministic demo data.

This should be visible but unobtrusive.

---

# 36. Performance

The application must remain responsive.

Avoid:

* unnecessary re-renders
* huge datasets
* expensive calculations on every render
* overly complex map layers
* unnecessary animation libraries

Precompute simulation frames where practical.

For the hackathon, it is acceptable to calculate the entire deterministic simulation locally and then animate the resulting frames.

---

# 37. Verification

After every feature:

Run appropriate checks.

At minimum:

```bash
npm install
npm run dev
npm run build
```

If linting/testing exists:

```bash
npm run lint
npm test
```

Verify:

* no TypeScript errors
* no console errors
* no broken imports
* no UI overflow
* responsive layout
* simulation actually progresses
* deterministic output remains deterministic

For every feature, define concrete acceptance criteria before implementation.

---

# 38. README

Maintain the root README.

Append significant changes.

Do not rewrite existing history.

Document:

* architecture
* simulation approach
* demo scenario
* major features
* setup
* important technical decisions
* known limitations

Explicitly state that the wildfire model is a **deterministic hackathon simulation**, not a production fire prediction engine.

---

# 39. Coding Behavior

You are NOT allowed to silently make large architectural decisions.

Before implementing a non-trivial phase, briefly state:

### Assumptions

What you assume.

### Scope

What you will implement.

### Not in scope

What you will deliberately not implement.

### Verification

How you will verify it.

Then implement.

If a requirement is genuinely ambiguous, stop and ask.

Do not invent requirements.

---

# 40. Most Important Rule

Do not build a generic dashboard.

Build a compelling answer to one question:

# “WHAT HAPPENS IF WILDFIRE STARTS HERE?”

The user must SEE the answer unfold.

The core visual narrative is:

```text
IGNITION
   ↓
FIRE SPREAD
   ↓
NEIGHBORHOOD THREAT
   ↓
ROAD CONGESTION
   ↓
BOTTLENECK
   ↓
EVACUATION DELAY
   ↓
INFRASTRUCTURE AT RISK
   ↓
EMERGENCY RESPONSE
   ↓
SCENARIO COMPARISON
   ↓
BETTER DECISION
```

Every feature must strengthen this narrative.

If a proposed feature does not improve this narrative or the hackathon judging experience, defer it.

---

# 41. First Task

Do NOT implement the entire product immediately.

Start with **PHASE 0 — Foundation**.

First inspect the existing repository.

Then report:

1. Current project structure
2. Existing technology
3. Existing reusable code
4. What can be preserved
5. What needs to be created
6. Exact Phase 0 plan
7. Acceptance criteria

Then implement only Phase 0.

After Phase 0 is verified, proceed to Phase 1.

Continue feature-by-feature until the product is demo-ready.

The final objective is a **high-impact, visually convincing RESILIA hackathon prototype**, not a production-scale platform.
