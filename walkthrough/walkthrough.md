# RESILIA walkthrough

Audience: hackathon teammates. Explain what the screen does. Do not pitch it.

Start at the app root (`/`). The dev server is Vite, usually `http://localhost:5173/`. The basemap needs a network connection. Wait until the 3D buildings are visible before any map screenshot.

If the header already shows a role, click **Switch role** so the walkthrough starts on the landing screen.

The demo hour is fixed: ignition **Ignition — Ridgeline forest edge**, wind direction **NE**, wind speed **high**, dryness **high**, severity **severe**. Set those controls if the screen shows anything else. Saved runs already in the browser should be left alone. This walkthrough adds two new ones.

## 1. Landing

Open `/`.

Wait until the heading **What happens if wildfire starts here?** is visible, with two buttons: **I live here** and **I manage the response**.

Screenshot: `01-landing.png`.

Explain: RESILIA is a digital twin of a demo town, Cedar Ridge. It plays the hour after a wildfire starts. Same settings always give the same hour. One button is the person who has to leave. The other is the person who manages the response.

## 2. Enter as the authority

Click **I manage the response**.

A short **Verifying access — Authority** line may appear. Wait until the twin is on screen: the **Ignition** menu, the impact cards, the map, and the timeline from **T+00** to **T+60**. The header should say **Authority**.

Confirm the ignition menu says **Ignition — Ridgeline forest edge**. Confirm **Scenario parameters** are wind **NE**, wind speed **high**, dryness **high**, severity **severe**. The timeline should be at **T+00**. If it is not, click **T+00**.

Screenshot: `02-ignition.png`.

Explain: This is Cedar Ridge at the first minute. The fire starts on the forest edge above Ridgeline. The cards are still quiet because the fire is a point. Ridgeline is already told to leave toward Central Avenue Shelter. The other neighborhoods are on advisory or standby. The left side sets the weather. Changing any of those values starts the hour over.

## 3. Fifteen minutes later

On the timeline, click **T+15**. Wait until the readout under the map says **T+15 min**.

Screenshot: `03-fifteen-minutes.png`. Include the cards and the map.

Explain: Orange is the active front, dark red is land already burned, and gray is smoke downwind. Roads turn from cyan to amber to crimson as they slow and close. At this minute Ridgeline Drive is closed, so people still on the ridge are stranded. Clearance is the time the people who can still drive need. The exposed-residents card can still read 0, because that card counts only people inside the flames. The evacuation is ahead of the fire.

## 4. Who is stuck

Click **View detailed impact breakdown (facilities, roads, evacuation, neighborhoods)**. Wait until the neighborhood list is visible.

Screenshot: `04-breakdown.png`.

Point out three neighborhoods if they are on screen:

- **Creekside** is almost clear, south on Hollow Creek Lane toward the South Perimeter Gate.
- **Ridgeline** has been ordered out since ignition, and the people still there cannot drive out.
- **Town Center** is on warning. Its evacuate order is at **T+16**, onto Central Avenue, which is already crowded.

Explain: The town-wide clearance number hides this split. A green edge on a road is still the recommended way out. An amber edge means that way is now a detour.

Click **Hide impact analysis breakdown** before the next step.

## 5. Send one engine

Stay at **T+15**. In **Emergency response**, Engine 01 should already be selected. If it is not, click **Engine 01**.

Open **Target for Engine 01** and choose **Active fire front** under **Fire front**.

Click **Deploy unit**. Wait until the Engine 01 row shows a destination and an ETA, and a route is drawn on the map.

Click **▶ Play**, then click **5x**. Let the unit move for a few seconds. Click **❚❚ Pause**.

Screenshot: `05-engine-deployed.png`.

Explain: Four units start at the fire station, the hospital, and the shelter: Engine 01, Engine 02, Ambulance 01, and the Command Unit. Deploy draws a route on the roads and an arrival time. Playback moves the unit with the timeline. A closed road is used only when there is no other way, and then the trip takes longer. **Recall** sends the unit home. Changing the weather clears every assignment.

## 6. Save this hour

Click **Save for Review**. Wait for the **Saved scenarios** dialog.

Leave the suggested name. It should mention the northeast wind, severe conditions, the ridgeline forest edge, and **T+15**. Click the dialog's **Save for Review** button. Wait until the new row appears in the list.

Screenshot: `06-saved-severe.png`.

Click **Close**.

Explain: A saved run keeps the name, the ignition, the weather, the minute, any units that were sent, and the numbers at that minute. It stays in this browser. Opening it later rebuilds the same hour.

## 7. Save a quieter hour

In **Scenario parameters**, set **Severity** to **low**.

Wait until the readout returns to **T+00**. The engine assignment should be gone.

Click **T+15** on the timeline. Wait until the readout says **T+15 min**.

Click **Save for Review**. Leave the new suggested name. It should now say the severity is low. Click the dialog's **Save for Review** button. Wait until both rows are in the list.

Screenshot: `07-two-saves.png`.

Explain: Lower severity is a different hour. Orders move later, and clearance at the first minute is longer. The clock restarted because the settings changed.

## 8. Compare the two hours

In the **Saved scenarios** list, mark the severe **T+15** row as **A** and the low-severity **T+15** row as **B**. Use the **A** and **B** buttons on those rows, not on any older saves.

Click **Compare**. Wait until the dialog **Scenario A and Scenario B** shows two maps and a comparison table.

Screenshot: `08-compare.png`. Include the headline above the maps and the table.

Explain: Both maps share the same camera and the same minute. The line above the maps names the largest gap. The table compares burned area, exposed residents, buildings at risk, clearance, blocked roads, bottlenecks, units deployed, and critical facilities. **▲** means B is worse than A on that row. **▼** means B is better.

Click **Close**.

## 9. The resident view

Click **Switch role**. Wait for the landing screen.

Click **I live here**. Wait until the twin loads and the header says **Resident**. There should be no **Emergency response** panel and no **Save for Review** button.

Open the **Ignition** menu and choose **220 Ridgeline Drive**. Wait until the line under the menu says the fire starts at **220 Ridgeline Drive** in the Ridgeline neighborhood. The clock returns to **T+00**.

Click **T+15**.

Screenshot: `09-resident.png`.

Explain: The resident sees the same town and the same hour, without units or saved comparisons. They pick where the fire starts and read the route, the safe zone, and whether that road is still open.

## Done

The walkthrough ends on the resident view at **T+15** for 220 Ridgeline Drive. Do not remove the saved scenarios.
