# RESILIA

RESILIA is a hackathon prototype of a disaster digital twin: a working model of a town you can run forward in time. It answers one question: **what happens if a wildfire starts here?**

You choose where the fire starts and how bad the conditions are. The app plays the next hour. You see the flames, the smoke, the traffic, the evacuation orders, and, if you are managing the response, the emergency units. You can save that hour and compare it with another one.

The town and the fire are a fixed demo. The same choices always produce the same hour. It is a way to rehearse a decision, not a live forecast.

## Why it exists

Cities rehearse fires inside buildings. They rarely rehearse the hour a wildfire reaches a neighborhood: which road closes, who is still on it, and where the engines should have gone before that happened.

The reference case is Mati, Greece, in July 2018. A fire reached a seaside town and 104 people died within about an hour. People did not know where the fire would go, and the evacuation had not been rehearsed.

RESILIA is that rehearsal. You burn the town in the model, then you decide.

## Two ways to look at the same town

The first screen asks who you are. Both choices open the same town. The header shows the role. **Switch role** returns to the first screen.

**I live here** is the resident. They see where the fire starts, the conditions, the map, the impact cards, the evacuation, and the timeline. The question for them is personal: is my street still open, which way do I go, and which safe place am I heading to?

**I manage the response** is the authority. They see everything the resident sees, and they can also send units, save a run, and compare two runs. The question for them is operational: who leaves when, which road fails, and where should the engines go?

## The screen

Across the top, **Ignition** chooses where the fire starts. The default is the forest edge above the ridge. The menu can move it to one of five home addresses. Moving it starts the hour over.

The left side is **Scenario parameters**: wind direction, wind speed, dryness, and severity. Wind direction runs from N through NW. Wind speed and dryness are low, moderate, or high. Severity is low, moderate, or severe. Changing any of them starts the hour over. For the authority, it also sends every unit back to its station.

Under that, the authority has **Emergency response**: pick a unit, pick a target, deploy it, or recall it. **Save for Review** is at the top of that column.

The cards across the top follow the minute you are looking at:

- Exposed residents and buildings at risk, meaning people and buildings inside the fire itself
- Evacuation traffic: how fast the roads are moving, and where they are jammed
- Clearance time: how long the people who can still drive need to get out
- Emergency units, for the authority
- Critical facilities
- The fire front: area burned, perimeter, and how fast it is spreading

**View detailed impact breakdown** opens the facilities, the roads, and the four neighborhoods one by one.

The map is the town in three dimensions. The bar under it reads the same minute in one line: time since ignition, fire perimeter, average evacuation speed, throughput, clearance, percent evacuated, and, for the authority, how many units are out and the next arrival time.

The timeline runs from **T+00** to **T+60**, in steps of five minutes. You can play, pause, step forward or back, reset to ignition, or click any **T+** label to jump there. Speeds are 1x, 2x, 5x, and 10x. The map, the cards, and the bar all move together.

## Cedar Ridge

Cedar Ridge is a fictional town placed on real foothill terrain where houses meet wildland, so the buildings and the roads look like a place. The names are made up.

About **4,240** people live here, in about **720** buildings, across four neighborhoods:

| Neighborhood | People | Buildings | Where |
| --- | --- | --- | --- |
| Ridgeline | 920 | 155 | Northeast, against the forest |
| Town Center | 1,650 | 280 | Center and west |
| Lower Village | 1,240 | 210 | Center |
| Creekside | 430 | 75 | South |

Five roads carry the evacuation: **Central Avenue**, **Mountain Road**, **Pine Street**, **Ridgeline Drive**, and **Hollow Creek Lane**.

Two patches of vegetation feed the fire. **Ridgeline forest edge** is dense forest on the hill. **Hollow Creek brushland** is brush down by the creek. The front moves faster while it is inside either of them.

Five places matter beyond the houses:

| Place | On the map | Why it matters |
| --- | --- | --- |
| Ridgeline Medical Center | H | Hospital. The ambulance starts here. |
| Cedar Ridge Elementary | Sc | School, and a safe zone. |
| Fire Station 4 | FS | Both fire engines start here. |
| Central Avenue Shelter | Sh | Shelter, and a safe zone. The command unit starts here. |
| Substation 9 | Pw | Power. |

Each facility is marked safe, on alert, threatened, or compromised, depending on how close the fire and the smoke are.

The ignition menu can also start the fire at a home: **12 Pine Street**, **45 Mountain Road**, **8 Central Avenue**, **220 Ridgeline Drive**, or **76 Hollow Creek Lane**.

People are sent to one of three safe zones: **Central Avenue Shelter**, **Cedar Ridge Elementary**, or the **South Perimeter Gate**. A green circle means that place is still taking people. A red circle means it is no longer safe. Every neighborhood has a main route and a backup. When the main shelter or the main road fails, the backup is usually the South Perimeter Gate, south along Hollow Creek Lane.

## What the hour does

**Fire.** It grows out from the ignition point. It runs faster with the wind than against it, faster uphill toward the ridge than downhill, and faster through the forest and the brush. High dryness and high severity make the whole front move faster. Play the same settings twice and you get the same shape.

**Smoke.** A separate cloud, always bigger than the fire, stretched downwind. The smoke is the part that reaches people and roads before the flames do.

**Roads.** As neighborhoods are told to leave, cars load the five roads. A road slows, jams, or closes when the fire reaches it. Moving dots on the map are the traffic. A marked point is a bottleneck.

**Evacuation.** Orders are staggered so the whole town does not enter the roads at once. Worse wind, dryness, and severity pull those orders earlier. A neighborhood moves through standby, advisory, warning, evacuate, and cleared. People start leaving when the warning window opens, before the full evacuate order.

Clearance time is how long the neighborhoods that can still drive need. People left on a road that has already closed are counted separately, as stranded. They become the city's clearance number only when every remaining way out is closed.

**Units.** Only the authority moves these. Four of them:

| Unit | On the map | Starts at |
| --- | --- | --- |
| Engine 01 | E1 | Fire Station 4 |
| Engine 02 | E2 | Fire Station 4 |
| Ambulance 01 | A1 | Ridgeline Medical Center |
| Command Unit | CMD | Central Avenue Shelter |

Choose a unit and a target. A target can be the fire front, a neighborhood, the hospital, a safe zone, or a bottleneck that exists at that minute. **Deploy unit** draws the route and an arrival time. Play, pause, and jumping along the timeline move the unit with the clock. The route stays on open roads. If the only way in is a closed road, the route still goes that way and the arrival takes longer. **Recall** sends the unit home.

## The hour to learn first

Leave the settings on the default: wind from the **northeast**, wind speed **high**, dryness **high**, severity **severe**, fire starting on the **Ridgeline forest edge**.

At **T+00** the fire is still a point. Clearance is **29 minutes**. Ridgeline is already told to leave toward Central Avenue Shelter, about **12 minutes** if Ridgeline Drive stays open. Lower Village and Creekside are on advisory. Town Center is on standby. Its order comes at **T+16**, toward the elementary school.

Jump to **T+15**:

- About **19 hectares** burned, a perimeter of **1.6 km**, spreading at about **20 meters a minute**.
- About **42%** of the town has left. Traffic is moving at about **34 vehicles a minute**.
- Clearance is about **25 minutes**. Ridgeline Drive is closed. **468** people are still on the ridge, looking at roughly **75 minutes** on foot. Their assigned shelter is still Central Avenue Shelter. They cannot reach it by road.
- Creekside is almost clear, about **2 minutes** south on Hollow Creek Lane to the South Perimeter Gate. That road is still open.
- Town Center is on warning. Its evacuate order is one minute away, onto Central Avenue, which is already crowded.
- The exposed-residents and buildings-at-risk cards can still say **0**. Those cards count only what the flames have reached. The evacuation is ahead of the fire.

Send Engine 01 to the fire front at **T+00** and it arrives in about **6 minutes 30 seconds**, on open roads. Send that same engine to the Ridgeline Drive bottleneck at **T+15** and the trip is about **20 minutes**, because that closed road is the only way there.

Set severity to **low** and the hour is a different incident. Clearance at ignition becomes **38 minutes**. The evacuate orders move later. Ridgeline is only on advisory, and its order waits until **T+09**.

That is the point of the demo. At the first minute the ridge still has a road. Fifteen minutes later it does not, and 468 people are on the wrong side of it.

## Save and compare

**Save for Review** keeps the current hour in this browser: the name, where the fire started, the weather, the minute on screen, any units you sent, and the numbers at that minute. The list is still there after a refresh. **Open** puts that hour back on the map. **Remove** deletes one entry.

**Compare** needs two saved hours. Mark one **A** and the other **B**. Both maps show the same town from the same angle, and one clock moves both of them from **T+00** to **T+60**. The clock starts on the later minute the two runs were saved at.

The line above the maps names the biggest gap. The table under the clock shows burned area, exposed residents, buildings at risk, clearance time, blocked roads, bottlenecks, units deployed, and critical facilities. The last column is how far B has moved from A. A change that makes the incident worse is marked with **▲**. A change that makes it better is marked with **▼**.

Use it to see what changes when the fire starts somewhere else, or when the day is less severe.

## How to read the map

- Dashed cyan lines are the four neighborhoods.
- Dark green areas are the forest and the brush. The fire accelerates there.
- The bright orange band is the active front. Dark red is land that has already burned. The gray veil is smoke.
- A neighborhood's fill is its order: advisory, warning, evacuate, or cleared.
- A green edge along a road is the recommended way out. An amber edge means that way is now a detour.
- Roads are cyan when traffic is moving, amber when it is slowing, and crimson when the road is closed.
- The raised white shapes are the buildings.
- E1, E2, A1, and CMD are the units. After you deploy one, its route and destination stay on the map. The resident does not see these.

## What this version is

One hazard, wildfire, in one demo town. The resident gets a route and a safe zone. The authority gets the same picture, plus units and a way to hold two hours side by side.

A later version of the idea would cover more than fire: orders timed so the roads do not all fail together, a record of who ordered what and when, and Compare used to choose what to build or clear before the money is spent. Power failing and taking water and traffic lights with it, a list of residents who cannot leave alone, and people who do not follow the order are not part of this version.

This version also has no live weather, no scientific fire model, no search for a real address, and no link to emergency alerts. The five addresses and the forest edge are the places the fire can start.
