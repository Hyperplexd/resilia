# RESILIA walkthrough presentation

A 10-slide deck for hackathon teammates. It follows `walkthrough/walkthrough.md` and uses screenshots from the running app.

## Deliverables

- `presentation/presentation.pptx` — editable PowerPoint, 16:9, 10 slides
- `presentation/screenshots/` — the nine captured screens
- `presentation/walkthrough-report.md` — what happened on each step
- `presentation/generate-pptx.mjs` — rebuilds the deck from those screenshots

No PDF. PowerPoint and LibreOffice are not installed on this machine, so the deck was not converted or visually rendered in an office app. The file was checked as a package: 10 slides, widescreen size, nine PNG images, and no shape past the slide edge.

## Walkthrough

`walkthrough/walkthrough.md`

Audience is teammates. The path is the landing screen, the authority hour at the forest edge, T+15, the neighborhood breakdown, one engine, two saved hours, the comparison, then the resident view at 220 Ridgeline Drive.

## Rebuild

From the repo root, with the screenshots already in `presentation/screenshots/`:

```bash
node presentation/generate-pptx.mjs
```

This script does not add a dependency to the app. It writes the PowerPoint directly.

## Limitations

- The basemap needs a network connection. These shots were taken against `http://localhost:5173/`.
- Playback of Engine 01 ran to **on scene at T+41** before pause. The saved severe hour was then taken at **T+15**, where that same dispatch shows ETA **17:37** and a route that uses a closed road.
- After switching to the resident, the scenario was the default severe hour, not the low-severity run left on the authority screen.
- Some authority shots are the top of a scrolling page, so the timeline is below the frame. The breakdown shot is scrolled to the four columns. The resident shot includes the timeline.
