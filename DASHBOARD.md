# Dashboard

The authority works in the digital twin. Choosing **I manage the response** opens the live incident at ignition. There is no separate frozen briefing.

The incident is the hero scenario. Wind is from the northeast, wind speed and dryness are high, and severity is severe. The fire starts on the ridgeline forest edge. The same inputs always produce the same picture.

## Open it

From the landing screen, choose **I manage the response**. After a short “Verifying access” beat you land on the twin at **T+00**. The **Ignition** menu at the top starts on **Ignition — Ridgeline forest edge** and also lists the five demo addresses; picking one moves the fire to that point and restarts at **T+00**. The header shows the **Authority** role. **Switch role** returns to the landing screen.

The old `/authority` address redirects here.

## What is on the screen

Seven cards follow the playhead. At ignition they are the quiet start of the hour: no exposed residents yet, clearance **29 min**, **0%** evacuated, and **0 / 4** units tasked.

The left column sets the scenario, then lists the four response units. The map is the town in 3D: buildings, cyan dashed neighborhood boundaries, the two fuel zones, roads colored by congestion, the fire, and the smoke. The timeline under the map runs from **T+00** to **T+60**. The readout under that keeps time, perimeter, evacuation speed, throughput, clearance, percent evacuated, units deployed, units on scene, and the next ETA.

## Read T+15

Click **T+15**. The cards, the map, and the breakdown are that minute:

| Card | At T+15 |
| --- | --- |
| Exposed residents | 0 — the fire perimeter has not yet overlapped the neighborhood sample points |
| Buildings at risk | 0 |
| Evacuation traffic | **21 km/h** average, **3** bottlenecks, **259** vehicles on the network |
| Clearance time | **25 min**, with **1** corridor blocked and **468** people stranded on closed roads |
| Emergency units | **0 / 4** until you deploy. The badge reads **4 staged** |
| Critical facilities | All **5** still operational |
| Fire front | **19.3 ha** burned, perimeter **1.6 km**, spread **20 m/min** |

**42%** of residents have left, throughput is about **34 veh/min**, and Ridgeline Drive is closed. The people who left the ridge in the first minutes are already on the network. The **468** who remain are the stranded count.

**View detailed impact breakdown** opens the drawer:

- **Lower Village** — evacuate, **71%** cleared, **359** people left, about **7 min**, down Central Avenue to Central Avenue Shelter. The avenue is congested.
- **Ridgeline** — evacuate since ignition, **49%** cleared, **468** still there, about **75 min** on foot because Ridgeline Drive is blocked. Their assigned shelter is still Central Avenue Shelter, but they cannot reach it by road.
- **Town Center** — warning, order scheduled for **T+16**, **5%** already moving, about **25 min**, toward Cedar Ridge Elementary along Central Avenue. That road is congested.
- **Creekside** — evacuate, **82%** cleared, **76** left, about **2 min**, south on Hollow Creek Lane to the South Perimeter Gate. That route is open.

The road list matches the map: Central Avenue is a heavy bottleneck at **26 km/h**, Mountain Road is at a standstill at **5 km/h**, Ridgeline Drive is closed, and Hollow Creek Lane is still moving at about **41 km/h**.

Neighborhood fill tells you the order, which is ahead of the exposure count in this minute:

- **Ridgeline**, **Lower Village**, and **Creekside** are filled as evacuate.
- **Town Center** is filled as warning.

The map shows the bright ember band, the dark red burned interior, and the gray smoke veil downwind. Roads are cyan when flowing, amber when slowing, crimson when closed. A green edge marks a corridor that is still the recommended way out; that edge turns amber on a detour. Vehicle pulses travel the open arteries. Red beacons sit on bottlenecks. Facility markers are **H**, **Sc**, **FS**, **Sh**, and **Pw**. Green circles mark safe zones that are receiving people. Unit labels sit by their stations: **E1** and **E2** at Fire Station 4, **A1** at the hospital, and **CMD** at the shelter.

## Deploy a unit

The **Emergency response** panel is on the left, under the scenario controls. Engine 01 starts selected. The **Emergency units** card follows the playhead.

1. Choose a target. The list is the active fire front, the four neighborhoods, Ridgeline Medical Center, the three evacuation zones (Central Avenue Shelter, Cedar Ridge Elementary, South Perimeter Gate), and any choke point that exists at this minute. At ignition there is no choke point in the list yet. By **T+15** the list includes Central Avenue, Mountain Road, and Ridgeline Drive.
2. Press **Deploy unit**. The map draws a dashed route in that unit’s color and a circle at the destination. The row reads the destination, an ETA as minutes:seconds, and status **DEPLOYED**.
3. Press **Play**. The unit moves along the route and the ETA counts down. Scrubbing the timeline moves it with the playhead. Jump to a minute before the dispatch and the unit is back at its station, with the row waiting on **Departs T+** that minute. At the destination the status becomes **ON SCENE** and the route stays on the map.
4. **Recall** clears the assignment and returns the unit to its station. Deploying the same unit again while it is already moving starts the new route from where it is now. Changing wind, dryness, or severity clears every assignment, because that is a new run.

| Dispatch | Target | Result |
| --- | --- | --- |
| Engine 01 at **T+00** | Active fire front | ETA **06:29**, route stays on open roads |
| Engine 01 at **T+15** | Central Avenue choke point | ETA **04:02**, route stays on open roads |
| Engine 01 at **T+15** | Ridgeline Drive choke point | ETA **20:01**. The row adds **Route uses a closed road**, because Ridgeline Drive is the only way there |

Click the unit label on the map for the same status, destination, and ETA. The same inputs and the same dispatch minute always produce the same route.

## Move through the hour

The timeline runs from **T+00** to **T+60** in five-minute steps. You can:

- Press **Play**, and **Pause** when you want to hold a minute.
- Step forward or back one node, or press reset to return to ignition.
- Run at **1x**, **2x**, **5x**, or **10x**.
- Click any **T+** label to jump there. The map, cards, and readout move together.

At ignition the fire is a point. Clearance is **29 min** and **0%** of the city has left. One order is already active: Ridgeline is told to evacuate down Ridgeline Drive, Mountain Road, and Central Avenue toward Central Avenue Shelter, about **12 min** if that road stays open. Lower Village and Creekside are on advisory. Town Center is on standby, with its order set for **T+16** and Cedar Ridge Elementary as its safe zone. The green corridor halo sits on the ridge roads and Central Avenue.

By **T+30**, Lower Village and Creekside have cleared. Town Center is under its evacuate order and is the neighborhood that sets the city clearance, about **33 min**, because Central Avenue is packed. Ridgeline Drive is still closed, so the ridge clearance on the drawer stays on the order of an hour even while the city number tracks the people who can still move.

By **T+60**, Town Center is down to a few minutes. The city clearance number drops with them. Ridgeline still shows a blocked route and the residents who never got off the ridge.

## Change the scenario

The panel on the left sets wind direction (N through NW), wind speed, dryness, and severity. Any change throws the playhead back to **T+00** and recomputes the whole hour.

Leave the hero wind and dryness as they are, and set severity to **low**. Clearance at ignition becomes **38 min** instead of **29**. Nobody is under an evacuate order yet. Ridgeline is only on advisory, with the order moved to **T+09**. Lower Village’s order moves to **T+15**, Creekside’s to **T+19**, and Town Center’s to **T+25**. Routes show open, and the stranded count is zero. Play forward again and the ridge road still closes once the fire reaches it, but the city has had a later, slower start.

Put severity back to **severe** and the original hour returns. **T+15** is the minute in the table above.

## Save for review

**Save for Review** sits at the top of the left column. It opens **Saved scenarios**.

Name the run. The field starts with a suggestion from the wind, the severity, the ignition, and the minute on screen, such as **NE wind · severe · Ridgeline forest edge · T+15**. **Save for Review** writes that run into this browser.

Each row shows when it was saved, the ignition, the wind settings, the minute, burned area, exposed residents, clearance, percent evacuated, and any units that were deployed. **Open** puts that run back on the twin: ignition, wind, dryness, severity, the playhead, and the dispatches. The map and the cards recompute from those inputs, so the same name always comes back to the same minute. **On screen** marks the row that matches what you are looking at. **Remove** deletes that one entry.

Leave the page and come back, or refresh it. The list is still there. A change to wind, dryness, severity, or ignition after you open a run starts a new hour and clears the dispatches, the same as any other new run.

## Compare two runs

Save the run you want as the baseline, change the wind or the ignition, and save that second run.

In **Saved scenarios**, press **A** on the first row and **B** on the second. **Compare** opens both at once. The two maps share the town camera, so the fire, the roads, and the units are what change. The clock under the maps moves both from **T+00** to **T+60**. It starts on the later minute the two runs were saved at.

The line above the maps names the largest gap. The table under the clock is Scenario A, Scenario B, and **B vs A**:

| | What it compares |
| --- | --- |
| Affected area | Hectares burned |
| Exposed residents | People inside the fire perimeter |
| Buildings at risk | Structures inside that perimeter |
| Clearance time | Minutes until the neighborhoods that can still move are clear |
| Blocked roads | Corridors the fire has closed |
| Bottlenecks | Roads the traffic model marks as choke points |
| Units deployed | Engines, the ambulance, and the command unit that are away from their stations |
| Critical facilities | Hospitals, schools, stations, shelters, or power sites that are no longer safe |

An increase that makes the incident worse is marked on that row, with **▲** and the percent change from A. A decrease is **▼**. **0** means the minute matches. **Close** returns to the twin.
