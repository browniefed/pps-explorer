# PPS School Explorer

TanStack Start + React + TypeScript + Leaflet, configured for Cloudflare Workers using Cloudflare's Vite plugin. Local Git repository; no remote or deployment has been created.

## Develop

```sh
npm install
npm run dev
```

Open http://localhost:3000. Node 22.12+ is required. The initial version has a single scenario selector, three grade levels, a street basemap, address geocoding, click-to-select locations, and a pathway panel comparing all nine scenario/grade combinations. Dependencies are installed. Type checking, lookup/data tests and the production build pass.

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

The extraction pipeline reads the nine original PDFs in public/maps and uses Python plus macOS PDFKit (Swift) to obtain geometry and school labels. It decodes PDF object streams, tracks drawing transforms, extracts attendance-boundary vector subpaths, and converts page coordinates using embedded geographic control points and Oregon North Lambert Conformal Conic. PDFs without geographic metadata use the status-quo high-school viewport based on the previously checked common page layout. Source SHA-256 and control points are recorded in every output. Original PDFs are in `public/maps`; previous viewer is in `public/original`.

**Extraction is provisional.** These are vector subpaths, not verified school catchments. School names are matched from PDF labels contained by the extracted polygons. Ambiguous or missing labels stay unresolved; no nearest-school fallback is used. Holes/disconnected parts are not fully classified and skyline inset geometry is not reconstructed. Clicks and address searches show estimated school pathways for all scenarios and grade levels, independently of the visible map layer. No current GIS dataset is substituted for PPS's proposed baseline.

Before enabling school assignment: verify georeferencing against independent street intersections; separate exterior rings/holes; deduplicate outlines; extract inset coverage; match each polygon to its attendance school; validate scenario coverage and known addresses. Then mark approved datasets reviewed, implement proximity-to-boundary checks, and populate the scenario-by-grade results table. No hypothetical future boundary projections are included.

Address searches go directly from the browser to Esri's geocoder and are not saved by the app. Public street tiles come from OpenStreetMap; attribution is displayed.

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

Tile policy: https://operations.osmfoundation.org/policies/tiles/ . The viewer uses the required HTTPS URL, visible attribution, browser caching, an explicit referrer policy and viewport-only tile requests. File previews do not request OSM tiles. No proxy, header spoofing, bulk download or cache bypass is used.
