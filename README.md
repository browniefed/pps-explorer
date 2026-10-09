# PPS School Explorer

TanStack Start + React + TypeScript + Leaflet, configured for Cloudflare Workers using Cloudflare's Vite plugin. Local Git repository; no remote or deployment has been created.

## Develop

```sh
npm install
npm run dev
```

Open http://localhost:3000. Node 22.12+ is required. The map fills the window with a floating panel (a bottom sheet on phones):

- Scenario (Status quo / A / B) and grade band (K–5 / 6–8 / 9–12) switches; areas are filled by high-school cluster using the PPS legend colours, K-8 areas dashed
- Optional dotted status-quo lines over Scenario A or B
- Address search (Esri geocoder) or click anywhere: a table shows the school for every scenario and grade band at that spot, with changes from status quo highlighted; points on a boundary line fall back to the nearest area within 150 m and are flagged
- School markers, area labels when zoomed in, hover details
- The view (scenario, grades, comparison, selected point) is kept in the URL hash, so a lookup can be shared as a link
- Links to the PPS board documents and the original PDFs for the visible grade band

Double-click `Start Local Preview.command` to install dependencies if needed and run the TanStack Start development server. Open http://localhost:3000. This is the primary local preview; Leaflet is imported through npm. The old standalone HTML remains an archived fallback and is not the TanStack application.

## Validate

```sh
npm test
npm run build
npm run typecheck
```

The Vite build generates `src/routeTree.gen.ts` before type checking. Data and lookup tests run without npm dependencies.

## Data

```sh
npm run data:extract
```

`scripts/pipeline/` (Python: PyMuPDF, Shapely, pyproj) reads the nine PDFs in `public/maps` and writes `public/data/{sq,a,b}_{k5,68,912}.geojson` plus a `_schools` point layer for each. One-time setup: `python3 -m venv scripts/pipeline/.venv && scripts/pipeline/.venv/bin/pip install -r scripts/pipeline/requirements.txt`.

- `extract.py`: vector paths in page coordinates: high-school cluster fills (named from the legend swatches), K-5 / 6-8 outlines, pre-dashed K-8 outlines (dash segments chained back into rings), and school labels paired with their icons. The NW inset is extracted as its own frame.
- `gpts.py`: page → NAD83(HARN) Oregon North transforms from the GeoPDF viewports (`/VP` `/GPTS`) embedded in `current-high.pdf`, one for the main map and one for the inset. All eleven PDFs share this page layout; only some carry the tags. Corner residuals are 3 m (main) and 9 m (inset), which is the rounding of the stored control points.
- `build.py`: rings → polygons, clipped to each frame; inset geometry fills only what the main map doesn't show. Each area is named from the school icon inside it (neighbourhood school preferred over an immersion program sharing the area) and assigned the cluster it overlaps most.
- `qa.py`: per-layer coverage against the district (union of 9-12 areas). There are no overlaps. The uncovered remainder is the Willamette River, which K-5 and 6-8 areas stop short of, and hairline slivers between neighbours.

Areas come from the PDFs' own vector paths and georeferencing, so positions are accurate to a few metres; still, confirm addresses that sit right on a line with PPS. Immersion-only programs don't get their own area. Original PDFs are in `public/maps`; the previous viewer is in `public/original`.

Address searches go directly from the browser to Esri's geocoder and are not saved by the app. The basemap is Esri World Light Gray Canvas (base + reference labels); attribution is displayed.

### School changes (closures, program moves, grade changes)

`src/lib/changes-data.mjs` transcribes the proposed changes for Scenarios A and B from the PPS board packet for October 6, 2026: the board memo ("Rightsizing Update: Scenario Release", Oct 5) and the regional summaries and district-wide comparison (Oct 3–4). It covers each closure and where its students go, immersion and other program moves, K–8 schools whose grades 6–8 move, and notes such as Sunnyside's focus option ending and Skyline's high school changing to Roosevelt. `src/lib/changes.mjs` turns these into the lookup notes, the "What changes" panel section and the school marker tooltips. It also flags open schools that lose their own attendance area on a scenario map. For example, Rigler stays open and receives Scott's Spanish immersion program, but in Scenarios A and B its area is part of Scott's.

`tests/changes.test.mjs` checks the transcription against the maps: every school it names appears on a map, and the closures match the "School Closed" labels exactly (14 in A, 11 in B).

### Spanish immersion: 1-mile reach

`scripts/pipeline/dli.py` writes `public/data/dli_reach.json`: the elementary schools labelled "Spanish Immersion" on each K-5 map (status quo matches PPS's *Enrollment Details for Language Immersion Schools, October 2025*), plus Bridger for 2022 (its Spanish immersion moved to Lent in fall 2023). It also writes the share of PPS land within one straight-line mile of a site: 18% in 2022 (10 schools), 16% today (9 schools) and 9% in Scenarios A and B (4 schools: César Chávez, Rigler, Lent, Ainsworth). Oregon law (ORS 327.043) requires transport for elementary students who live more than a mile from school; the law measures along a route, so the circles overstate the walkable area. They show geography only, because PPS doesn't publish where immersion students live. The map shows this behind the "Spanish immersion: 1-mile reach" setting.

### Checking against the City of Portland's boundary data

`scripts/pipeline/verify_city.py` compares our status quo areas with the City of Portland's `School_Boundaries` layer (snapshot in `scripts/pipeline/reference/`, last edited Nov 2025). Both datasets name the same school for 98.2% of the district at K–5, 94.1% at 6–8 and 98.2% at 9–12. The known differences are:

- **6–8, Beaumont/Roseway Heights.** The PPS status quo map puts the Cully/airport strip in Roseway Heights; the city layer puts it in Beaumont. Our data follows the PPS map.
- **9–12, Jefferson.** The city layer splits Jefferson into "Jefferson / Grant", "Jefferson / McDaniel" and "Jefferson / Roosevelt" choice zones, which the PPS cluster maps don't show.
- **Naming.** The city layer uses older or shorter names (Lee for Sunrise, Lane for Brentwood, Tubman, Ida B. Wells for Wells-Barnett, Bridger, Sunnyside); the script aliases them.

Thanks to [ppsdata.info](https://ppsdata.info) by Alex Meub ([meub/pps-data](https://github.com/meub/pps-data), MIT), whose repository pointed us to the board packet and the city boundary layer.

## Deploy after local review

```sh
npx wrangler login
npm run deploy
```

This targets Workers, not the old Pages ZIP. No database is needed for static boundary data. No secrets are checked in. The repo is ready for a GitHub remote when wanted; Cloudflare Workers Builds can connect to that repository later.

## Sources

- [PPS board map attachments, item 8](https://meetings.boardbook.org/Public/Agenda/915?meeting=769955)
- [ppsdata.info](https://ppsdata.info) / [meub/pps-data](https://github.com/meub/pps-data) by Alex Meub
- [City of Portland School_Boundaries layer](https://services.arcgis.com/quVN97tn06YNGj9s/arcgis/rest/services/School_Boundaries/FeatureServer/0)
- [Cloudflare TanStack Start integration](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Leaflet GeoJSON documentation](https://leafletjs.com/examples/geojson/)
