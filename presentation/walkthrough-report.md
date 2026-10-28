# Walkthrough report

App: `http://localhost:5173/` via `npm run dev`. Viewport 1440×900. Each step was checked in the page before the screenshot.

## 1. Landing

Succeeded. Heading **What happens if wildfire starts here?** with **I live here** and **I manage the response**.

Screenshot: `screenshots/01-landing.png`

## 2. Enter as the authority

Succeeded. **Verifying access — Authority**, then the twin. Ignition **Ignition — Ridgeline forest edge**. Wind **NE**, wind speed **high**, dryness **high**, severity **severe**. Header **Authority**. At T+00 the cards showed clearance **29 min**, **0** exposed residents, and all **5** facilities operational.

Screenshot: `screenshots/02-ignition.png`

The timeline sits below this frame because the page scrolls.

## 3. Fifteen minutes later

Succeeded. Readout **T+15 min**. Cards: **19.3 ha**, perimeter **1.6 km**, **20 m/min**, evacuation traffic **21 km/h** with **3** bottlenecks, clearance **25 min**, **1** blocked, **468** stranded.

Screenshot: `screenshots/03-fifteen-minutes.png`

## 4. Who is stuck

Succeeded. The breakdown opened. Ridgeline: evacuate, **49%** cleared, **468** left, **75 min**, route blocked. Creekside: evacuate, **82%** cleared, **76** left, **2 min**, Hollow Creek Lane open. Town Center: warning, **5%** cleared, order **T+16**, Central Avenue congested. The breakdown was then closed.

Screenshot: `screenshots/04-breakdown.png`

This shot is scrolled to the four columns, so the top cards are above the frame.

## 5. Send one engine

Succeeded, with a timing difference. Engine 01 was already selected. Target **Active fire front**. **Deploy unit** showed **DEPLOYED**, destination **Active fire front**, ETA **17:37**, and **Route uses a closed road**.

**Play** then **5x** kept running until the engine reached the front. Pause landed on **ON SCENE** at **T+41**, not a mid-route frame. That is the screenshot.

Screenshot: `screenshots/05-engine-deployed.png`

Before saving, the playhead was moved back to **T+15**. The same dispatch again showed ETA **17:37** and the closed-road note.

## 6. Save this hour

Succeeded. Suggested name **NE wind · severe · Ridgeline forest edge · T+15**. The new row was **On screen**, with **19.3 ha**, **0** exposed, **25 min** clearance, **42%** evacuated, **1** deployed, Engine 01 to the active fire front. Dialog closed afterward.

Screenshot: `screenshots/06-saved-severe.png`

## 7. Save a quieter hour

Succeeded. Severity set to **low**. Readout returned to **T+00** and Engine 01 was **STAGED** again. Jumped to **T+15**. Suggested name **NE wind · low · Ridgeline forest edge · T+15**. The new row showed **4.8 ha**, **0** exposed, **26 min** clearance, **4%** evacuated. Both rows were in the list. Older saves were not present.

Screenshot: `screenshots/07-two-saves.png`

## 8. Compare the two hours

Succeeded. Severe row marked **A**. Low row marked **B**. Compare opened **Scenario A and Scenario B**.

The line on screen: at T+15 the severe run has **300%** more burned area than the low run. Table at T+15: affected area **19.3 ha** vs **4.8 ha**, clearance **25 min** vs **26 min**, blocked roads **1** vs **1**, bottlenecks **3** vs **2**, units deployed **1** vs **0**. Exposed residents, buildings at risk, and critical facilities were **0** on both. Dialog closed afterward.

Screenshot: `screenshots/08-compare.png`

## 9. The resident view

Succeeded. **Switch role** returned to the landing screen. **I live here** opened the twin with header **Resident**. **Save for Review** and **Emergency response** were absent.

Ignition **220 Ridgeline Drive**. The line read **Wildfire starts at 220 Ridgeline Drive · Cedar Ridge — Ridgeline**. At **T+15**: **570** exposed residents, **78** buildings at risk, clearance **25 min**, Ridgeline **ALERT**, **19.3 ha**, **53%** evacuated.

After the role switch the scenario was the default severe hour again, not the low-severity hour left on the authority screen.

Screenshot: `screenshots/09-resident.png`

## Not done

The two saved runs were left in the browser, as the walkthrough asked. No PDF was produced.
