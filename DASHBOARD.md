# Dashboard

The command dashboard is the authority view of one wildfire in Cedar Ridge. It opens on a fixed operational snapshot, fifteen minutes after ignition, and from there you can open the live digital twin and move through the same incident minute by minute.

The incident below is the hero scenario. Wind is from the northeast, wind speed and dryness are high, and severity is severe. The fire starts on the ridgeline forest edge. The same inputs always produce the same picture.

## Open the command dashboard

From the landing screen, choose **I manage the response**. After a short “Verifying access” beat you land on **Cedar Ridge Civil Protection & Emergency Operations**. The header reads **INCIDENT COMMAND ACTIVE**, with the horizon locked at **T+15 min** and all four neighborhoods in view: Ridgeline, Lower Village, Creekside, and Town Center.

You can leave with **Switch role** in the top bar, or go deeper with **Launch Digital Twin** and **Open Live Simulation**. **Full screen map** opens the same twin.

## What the T+15 snapshot shows

Six cards sit under the header. In this scenario they read:

| Card | At T+15 |
| --- | --- |
| Exposed residents | 0 — the fire perimeter has not yet overlapped the neighborhood sample points |
| Buildings at risk | 0 |
| Evacuation traffic | **21 km/h** average, **3** bottlenecks, **259** vehicles on the network |
| Clearance time | **25 min**, with **1** corridor blocked and **468** people stranded on closed roads |
| Critical facilities | All **5** still operational |
| Fire front | **19.3 ha** burned, perimeter **1.6 km**, spread **20 m/min** |

The briefing panel under the cards turns those cards into an operational sentence:

- The front is described as pushing southwest toward Ridgeline and Lower Village.
- Evacuation traffic is **21 km/h**, with **3** bottlenecks and **259** vehicles en route.
- Clearance is **25 min**. **2,469** residents are still to move, **3** evacuation orders are active, and **468** are stranded.
- **1** road is blocked and **2** routes are under hazard.
- No critical facility has left the safe state yet.

The map on the right is that same minute, in 3D. You see the town’s buildings, the cyan dashed neighborhood boundaries, and the two fuel zones (ridgeline forest edge and Hollow Creek brushland). The fire is the bright ember band, the area already burned is the dark red interior, and smoke is the gray veil downwind. Roads are colored by congestion: cyan when flowing, amber when slowing, crimson when closed. A green edge marks a corridor that is still the recommended way out; that edge turns amber when the neighborhood has been sent on a detour. Vehicle pulses travel the open arteries. Red beacons sit on bottlenecks. Facility markers are labeled **H**, **Sc**, **FS**, **Sh**, and **Pw**. Green circles mark safe zones that are receiving people.

Neighborhood fill tells you the order, which is ahead of the exposure count in this snapshot:

- **Ridgeline**, **Lower Village**, and **Creekside** are filled as evacuate.
- **Town Center** is filled as warning.

**View detailed impact breakdown** opens the drawer. For this minute it spells the orders out:

- **Lower Village** — evacuate, **71%** cleared, **359** people left, about **7 min**, down Central Avenue to Central Avenue Shelter. The avenue is congested.
- **Ridgeline** — evacuate since ignition, **49%** cleared, **468** still there, about **75 min** on foot because Ridgeline Drive is blocked. Their assigned shelter is still Central Avenue Shelter, but they cannot reach it by road.
- **Town Center** — warning, order scheduled for **T+16**, **5%** already moving, about **25 min**, toward Cedar Ridge Elementary along Central Avenue. That road is congested.
- **Creekside** — evacuate, **82%** cleared, **76** left, about **2 min**, south on Hollow Creek Lane to the South Perimeter Gate. That route is open.

The road list in the same drawer matches the map: Central Avenue is a heavy bottleneck at **26 km/h**, Mountain Road is at a standstill at **5 km/h**, Ridgeline Drive is closed, and Hollow Creek Lane is still moving at about **41 km/h**.

## What you can do with the snapshot

On the command dashboard itself you read, you do not resimulate. The useful actions are:

- Scan the six cards, then the briefing, and decide which problem is first. In this minute it is the closed ridge road and the **468** people still on it, while the city-wide clearance for everyone who can still drive is **25 min**.
- Open the breakdown and compare a neighborhood’s order, route, safe zone, and road status.
- Click a road on the snapshot map for speed, load, and whether it is a choke point or an evacuation route.
- Click a facility for its threat status. Shelter and school popups also say whether that site is still an evacuation zone.
- Click a safe-zone circle to see if it is open and how many neighborhoods are still en route.
- Launch the twin when you need any minute other than T+15.

## Follow the same fire in the twin

**Launch Digital Twin** opens the incident at **T+00**, ignition labeled **Ignition — Ridgeline forest edge**. The cards, the map, and the readout now follow the playhead.

At ignition the fire is a point. Clearance is **29 min** and **0%** of the city has left. One order is already active: Ridgeline is told to evacuate down Ridgeline Drive, Mountain Road, and Central Avenue toward Central Avenue Shelter, about **12 min** if that road stays open. Lower Village and Creekside are on advisory. Town Center is on standby, with its order set for **T+16** and Cedar Ridge Elementary as its safe zone. The green corridor halo sits on the ridge roads and Central Avenue.

The timeline under the map runs from **T+00** to **T+60** in five-minute steps. You can:

- Press **Play**, and **Pause** when you want to hold a minute.
- Step forward or back one node, or press reset to return to ignition.
- Run at **1x**, **2x**, **5x**, or **10x**.
- Click any **T+** label to jump there. The map, cards, and readout move together.

Scrubbing to **T+15** reproduces the command dashboard: clearance **25 min**, **42%** evacuated, throughput about **34 veh/min**, average speed **21 km/h**, and Ridgeline Drive closed. The people who left the ridge in the first minutes are already on the network. The **468** who remain are the stranded count. Creekside is nearly at the South Perimeter Gate. Town Center is in the warning window and has not received the mandatory order yet.

By **T+30**, Lower Village and Creekside have cleared. Town Center is under its evacuate order and is the neighborhood that sets the city clearance, about **33 min**, because Central Avenue is packed. Ridgeline Drive is still closed, so the ridge clearance on the drawer stays on the order of an hour even while the city number tracks the people who can still move.

By **T+60**, Town Center is down to a few minutes. The city clearance number drops with them. Ridgeline still shows a blocked route and the residents who never got off the ridge.

The readout under the map keeps six figures in sync with the playhead: time since ignition, fire perimeter, average evacuation speed, throughput in vehicles per minute, clearance, and percent evacuated.

## Change the scenario

The panel on the left of the twin sets wind direction (N through NW), wind speed, dryness, and severity. Any change throws the playhead back to **T+00** and recomputes the whole hour.

Leave the hero wind and dryness as they are, and set severity to **low**. Clearance at ignition becomes **38 min** instead of **29**. Nobody is under an evacuate order yet. Ridgeline is only on advisory, with the order moved to **T+09**. Lower Village’s order moves to **T+15**, Creekside’s to **T+19**, and Town Center’s to **T+25**. Routes show open, and the stranded count is zero. Play forward again and the ridge road still closes once the fire reaches it, but the city has had a later, slower start.

Put severity back to **severe** and the original hour returns, including the T+15 picture on the command dashboard.
