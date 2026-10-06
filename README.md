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

## Deploy after local review

```sh
npx wrangler login
npm run deploy
```

This targets Workers, not the old Pages ZIP. No database is needed for static boundary data. No secrets are checked in. The repo is ready for a GitHub remote when wanted; Cloudflare Workers Builds can connect to that repository later.

## Sources

- [PPS board map attachments, item 8](https://meetings.boardbook.org/Public/Agenda/915?meeting=769955)
- [Cloudflare TanStack Start integration](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Leaflet GeoJSON documentation](https://leafletjs.com/examples/geojson/)
