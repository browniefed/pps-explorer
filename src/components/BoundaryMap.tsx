import { useEffect, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import type { Band, Scenario } from '../lib/assignments.mjs'
import { describe, eventsFor, schoolKey } from '../lib/changes.mjs'
import { closureMoves, immersionSites, PROGRAM_COLORS, programMoves, type ProgramMove } from '../lib/programs.mjs'

// Fill colours taken from the PPS map legend.
export const CLUSTERS: Record<string, string> = {
  Cleveland: '#41c400',
  Franklin: '#f21cb1',
  Grant: '#9aa3aa',
  Jefferson: '#65c7ea',
  Lincoln: '#f43759',
  McDaniel: '#3d3dff',
  Roosevelt: '#ffc800',
  'Wells-Barnett': '#8ade8e',
}

export type Layer = { areas: FeatureCollection; schools: FeatureCollection; changed?: FeatureCollection }

// Spanish DLI elementary sites per period and their 1-mile reach (scripts/pipeline/dli.py)
export type DliPeriod = { sites: { name: string; coords: [number, number]; note?: string | null }[]; reach_sq_mi: number; reach_share: number }
export type DliReach = { radius_miles: number; land_sq_mi: number; periods: Record<'2022' | 'sq' | 'a' | 'b', DliPeriod> }
const MILE_M = 1609.344
const DLI_COLOR = '#d9480f'

type Props = {
  datasets: Record<string, Layer> | null
  scenario: Scenario
  band: Band
  compare: boolean
  programs: boolean
  changes: boolean
  dli: DliReach | null
  dliReach: boolean
  position: [number, number] | null
  focusSelection: boolean
  // pixels of map hidden under the panel, so fitting and panning keep content visible
  panelInset: { left: number; bottom: number }
  onSelect: (point: [number, number]) => void
}

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/'

// Label anchor: centroid of the largest part, so multipart areas get one sensible label.
function labelPoint(f: Feature): [number, number] {
  const g = f.geometry as Polygon | MultiPolygon
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  let best: [number, number] = [0, 0], bestArea = -1
  for (const p of polys) {
    const r = p[0]
    let a = 0, cx = 0, cy = 0
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const cross = r[j][0] * r[i][1] - r[i][0] * r[j][1]
      a += cross
      cx += (r[j][0] + r[i][0]) * cross
      cy += (r[j][1] + r[i][1]) * cross
    }
    if (Math.abs(a) > bestArea) { bestArea = Math.abs(a); best = [cy / (3 * a), cx / (3 * a)] }
  }
  return best
}

// School marker tooltip: the map label plus what the board memo says happens to the school here.
function schoolTip(name: string, scenario: Scenario) {
  const tip = document.createElement('div')
  const title = document.createElement('strong')
  title.textContent = name
  tip.append(title)
  if (scenario === 'sq') return tip
  const key = schoolKey(name)
  for (const e of eventsFor(scenario, name)) {
    const p = document.createElement('p')
    p.textContent = describe(e, key)
    tip.append(p)
  }
  return tip
}

// "Lincoln cluster", or for an area split between high schools:
// "High school: Lincoln (54% of area) or Wells-Barnett (46%), by address"
function highSchoolText(p: Record<string, any>) {
  const split: { name: string; share: number }[] = p.clusters ?? []
  if (p.level === '9-12' || split.length < 2) return `${p.cluster} cluster`
  const parts = split.map((c, i) => `${c.name} (${Math.round(c.share * 100)}%${i === 0 ? ' of area' : ''})`)
  return `High school: ${parts.slice(0, -1).join(', ')} or ${parts.at(-1)}, by address`
}

// Curved arrow from one school to another, built in screen space so the curve and the arrowhead keep
// a constant on-screen size; rebuilt on zoom. Returns null when the two schools are too close to draw.
function arrowLayers(lf: typeof Leaflet, m: Leaflet.Map, move: ProgramMove & { detail?: string }): Leaflet.Layer[] | null {
  const a = m.latLngToLayerPoint([move.from[1], move.from[0]]), b = m.latLngToLayerPoint([move.to[1], move.to[0]])
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy)
  if (len < 24) return null
  const bend = Math.min(0.2 * len, 90)
  const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend }
  const at = (t: number) => ({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y })
  // stop short of both school markers
  const t0 = 10 / len, t1 = 1 - 15 / len
  const pts = Array.from({ length: 25 }, (_, i) => at(t0 + ((t1 - t0) * i) / 24))
  const tip = pts[pts.length - 1], prev = pts[pts.length - 2]
  const ux = tip.x - prev.x, uy = tip.y - prev.y, ul = Math.hypot(ux, uy) || 1
  const bx = tip.x - (ux / ul) * 12, by = tip.y - (uy / ul) * 12, px = (-uy / ul) * 6, py = (ux / ul) * 6
  const ll = (p: { x: number; y: number }) => m.layerPointToLatLng(lf.point(p.x, p.y))
  const line = pts.map(ll)
  const tipText = move.kind === 'closure'
    ? `${move.fromName} closes → students go to ${move.toName}${move.detail ? '. ' + move.detail : ''}`
    : `${move.program}: ${move.fromName} → ${move.toName}`
  return [
    lf.polyline(line, { pane: 'arrows', color: '#ffffff', weight: 7, opacity: 0.9, interactive: false }),
    lf.polyline(line, { pane: 'arrows', color: move.color, weight: 3.5, opacity: 0.95, dashArray: move.kind === 'closure' ? '7 5' : undefined })
      .bindTooltip(tipText, { sticky: true, className: 'hover-tip school-tip' }),
    lf.polygon([ll(tip), ll({ x: bx + px, y: by + py }), ll({ x: bx - px, y: by - py })],
      { pane: 'arrows', color: '#ffffff', weight: 1.5, fillColor: move.color, fillOpacity: 1, interactive: false }),
  ]
}

const mapLabel = (name: string) => name.replace(/ Elementary$/, '')

export function BoundaryMap({ datasets, scenario, band, compare, programs, changes, dli, dliReach, position, focusSelection, panelInset, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const L = useRef<typeof Leaflet | null>(null)
  const map = useRef<Leaflet.Map | null>(null)
  const layers = useRef<Leaflet.Layer[]>([])
  const labels = useRef<Leaflet.LayerGroup | null>(null)
  const pin = useRef<Leaflet.Marker | null>(null)
  const fitted = useRef(false)
  const select = useRef(onSelect)
  select.current = onSelect
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  // Leaflet touches window, so it is loaded client-side only.
  useEffect(() => {
    let disposed = false
    import('leaflet').then((mod) => {
      if (disposed || !container.current) return
      const lf = (L.current = (mod as unknown as { default?: typeof Leaflet }).default ?? mod)
      const m = (map.current = lf.map(container.current, { zoomControl: false, minZoom: 10, maxZoom: 17 }).setView([45.535, -122.66], 12))
      lf.control.zoom({ position: 'topright' }).addTo(m)
      lf.tileLayer(ESRI + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        maxNativeZoom: 16,
        attribution: 'Basemap © Esri, HERE, Garmin, © OpenStreetMap contributors · Boundaries traced from PPS scenario maps',
      }).on('tileerror', () => setError('Basemap tiles could not load. Boundaries remain available.')).addTo(m)
      for (const [name, z] of [['shading', 390], ['changed', 395], ['areas', 400], ['dli', 440], ['compare', 450], ['arrows', 580], ['sites', 590], ['schools', 600], ['reference', 620], ['labels', 650]] as const) {
        m.createPane(name).style.zIndex = String(z)
      }
      m.getPane('reference')!.style.pointerEvents = 'none'
      // permanent area/school labels must never cover hover tooltips: keep them under Leaflet's
      // tooltip pane (650 by default, the same z as 'labels', and later in the DOM) and let the
      // pointer pass through them to the shapes underneath
      m.getPane('labels')!.style.pointerEvents = 'none'
      m.getPane('dli')!.style.pointerEvents = 'none'
      m.getPane('tooltipPane')!.style.zIndex = '700'
      // street names drawn above the coloured areas so they stay readable
      lf.tileLayer(ESRI + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { pane: 'reference', maxZoom: 18, maxNativeZoom: 16 }).addTo(m)
      m.on('click', (e) => select.current([e.latlng.lat, e.latlng.lng]))
      setReady(true)
    }).catch(() => setError('Could not initialize the map.'))
    return () => { disposed = true; map.current?.remove(); map.current = null }
  }, [])

  // Boundaries, comparison lines, school markers and area labels for the visible layer.
  useEffect(() => {
    const lf = L.current, m = map.current
    if (!ready || !lf || !m || !datasets) return
    const d = datasets[`${scenario}_${band}`]
    const hs = band === '912'
    const added: Leaflet.Layer[] = []
    // Shading is always the scenario's high school areas, drawn under the K-5 / 6-8 outlines the way
    // PPS's maps do it: an elementary or middle area that feeds two high schools shows both colours.
    if (!hs) {
      added.push(lf.geoJSON(datasets[`${scenario}_912`].areas, {
        pane: 'shading',
        interactive: false,
        style: (f) => ({ stroke: false, fillColor: CLUSTERS[f?.properties?.cluster] ?? '#888', fillOpacity: 0.22 }),
      }).addTo(m))
    }
    const style = (f?: Feature): Leaflet.PathOptions => ({
      pane: 'areas',
      color: hs ? '#00538b' : '#26323b',
      weight: hs ? 3 : 1.5,
      opacity: 0.85,
      // K-5 / 6-8 areas keep an invisible fill so hovering and clicking anywhere inside still works
      fillColor: hs ? CLUSTERS[f?.properties?.cluster] ?? '#888' : '#17232c',
      fillOpacity: hs ? 0.22 : 0,
      dashArray: f?.properties?.level === 'K-8' ? '6 4' : undefined,
    })
    const areas: Leaflet.GeoJSON = lf.geoJSON(d.areas, {
      style,
      onEachFeature(f, layer) {
        const p = f.properties ?? {}
        const tip = document.createElement('span')
        const strong = document.createElement('strong')
        strong.textContent = p.name
        tip.append(strong, document.createElement('br'), `${highSchoolText(p)} · ${p.area_sqmi} sq mi`)
        layer.bindTooltip(tip, { sticky: true, className: 'hover-tip' })
        layer.on('mouseover', () => (layer as Leaflet.Path).setStyle(hs ? { fillOpacity: 0.42, weight: 4 } : { fillOpacity: 0.12, weight: 2.5 }))
        layer.on('mouseout', () => areas.resetStyle(layer))
      },
    }).addTo(m)
    added.push(areas)

    if (compare && scenario !== 'sq') {
      added.push(lf.geoJSON(datasets[`sq_${band}`].areas, {
        pane: 'compare',
        interactive: false,
        style: { color: '#0b1620', weight: 3, opacity: 0.9, fill: false, dashArray: '0.1 6', lineCap: 'round' },
      }).addTo(m))
    }

    added.push(lf.geoJSON(d.schools, {
      pointToLayer(f, ll) {
        const kind = f.properties?.kind
        if (kind === 'closed') {
          return lf.marker(ll, {
            pane: 'schools', keyboard: false,
            icon: lf.divIcon({ className: 'closed-icon', html: '×', iconSize: [20, 20], iconAnchor: [10, 10] }),
          }).bindTooltip(schoolTip(String(f.properties?.name ?? ''), scenario), { className: 'hover-tip school-tip' })
        }
        return lf.circleMarker(ll, {
          pane: 'schools',
          radius: kind === 'closed' ? 4 : 5,
          color: kind === 'closed' ? '#7a8691' : '#17232c',
          weight: 1.5,
          fillColor: kind === 'focus' ? '#6b1f3d' : '#ffffff',
          fillOpacity: 1,
        }).bindTooltip(schoolTip(String(f.properties?.name ?? ''), scenario), { className: 'hover-tip school-tip' })
      },
    }).addTo(m))

    labels.current = lf.layerGroup(d.areas.features.map((f) =>
      lf.tooltip({ permanent: true, direction: 'center', className: 'area-label', pane: 'labels', interactive: false })
        .setLatLng(labelPoint(f))
        .setContent(mapLabel(String(f.properties?.name ?? '')))))
    const showLabels = () => {
      const g = labels.current
      if (!g) return
      const on = m.getZoom() >= (band === 'k5' ? 13 : 12)
      if (on && !m.hasLayer(g)) g.addTo(m)
      if (!on && m.hasLayer(g)) m.removeLayer(g)
    }
    showLabels()
    m.on('zoomend', showLabels)

    if (!fitted.current && !position) {
      fitted.current = true
      m.fitBounds(lf.geoJSON(datasets.sq_912.areas).getBounds(), {
        paddingTopLeft: [panelInset.left, 0],
        paddingBottomRight: [0, panelInset.bottom],
        // instant: an animated fit still running when a shared link zooms to its point would win and undo it
        animate: false,
      })
    }

    layers.current = added
    return () => {
      m.off('zoomend', showLabels)
      for (const l of added) m.removeLayer(l)
      if (labels.current) m.removeLayer(labels.current)
      labels.current = null
    }
  }, [ready, datasets, scenario, band, compare])

  // Spanish DLI elementary sites: a 1-mile circle around each site in the shown scenario, and dashed
  // grey circles for sites that had Spanish immersion in 2022 but not here.
  useEffect(() => {
    const lf = L.current, m = map.current
    if (!ready || !lf || !m || !dli || !dliReach) return
    const now = dli.periods[scenario]
    const current = new Set(now.sites.map((x) => x.name))
    const group = lf.layerGroup()
    for (const site of dli.periods['2022'].sites) {
      if (current.has(site.name)) continue
      group.addLayer(lf.circle([site.coords[1], site.coords[0]], {
        pane: 'dli', interactive: false, radius: MILE_M, color: '#6c757d', weight: 2, dashArray: '6 6', fill: false,
      }))
    }
    for (const site of now.sites) {
      group.addLayer(lf.circle([site.coords[1], site.coords[0]], {
        pane: 'dli', interactive: false, radius: MILE_M, color: DLI_COLOR, weight: 2.5, fillColor: DLI_COLOR, fillOpacity: 0.08,
      }))
    }
    group.addTo(m)
    return () => { m.removeLayer(group) }
  }, [ready, dli, dliReach, scenario])

  // Where the assigned school changes from status quo (hatched), and closure arrows to receiving schools.
  useEffect(() => {
    const lf = L.current, m = map.current
    if (!ready || !lf || !m || !datasets || !changes || scenario === 'sq') return
    const d = datasets[`${scenario}_${band}`]
    const added: Leaflet.Layer[] = []
    if (d.changed) {
      added.push(lf.geoJSON(d.changed, {
        pane: 'changed',
        interactive: false,
        // the hatch pattern is defined in the <svg> rendered below; CSS points the fill at it
        style: { className: 'changed-area', stroke: true, color: '#17232c', weight: 1.5, opacity: 0.7, dashArray: '2 3', fillOpacity: 1 },
      }).addTo(m))
    }
    const moves = closureMoves(scenario, { scenarioSchools: d.schools, sqSchools: datasets[`sq_${band}`]?.schools })
    const arrows = lf.layerGroup().addTo(m)
    added.push(arrows)
    const draw = () => {
      arrows.clearLayers()
      for (const mv of moves) for (const l of arrowLayers(lf, m, mv) ?? []) arrows.addLayer(l)
    }
    draw()
    m.on('zoomend', draw)
    return () => {
      m.off('zoomend', draw)
      for (const l of added) m.removeLayer(l)
    }
  }, [ready, datasets, scenario, band, changes])

  // Immersion overlay: language rings around immersion schools, labels, and arrows for program moves.
  useEffect(() => {
    const lf = L.current, m = map.current
    if (!ready || !lf || !m || !datasets || !programs) return
    const d = datasets[`${scenario}_${band}`]
    const areaKeys = new Set(d.areas.features.map((f) => schoolKey(String(f.properties?.name ?? ''))))
    const sites = immersionSites(d.schools, areaKeys)
    const rings = lf.layerGroup()
    const siteLabels = lf.layerGroup()
    for (const site of sites) {
      const ll: [number, number] = [site.coords[1], site.coords[0]]
      site.languages.forEach((lang, i) => rings.addLayer(lf.circleMarker(ll, {
        pane: 'sites', interactive: false, radius: 10 + i * 4, weight: 3, fill: false, color: PROGRAM_COLORS[lang] ?? '#495057',
        // dashed: immersion-only school with no neighbourhood area of its own on this map
        dashArray: site.ownArea ? undefined : '4 3',
      })))
      const tip = document.createElement('span')
      tip.textContent = `${site.short} · ${site.languages.join(' & ')}`
      tip.style.color = PROGRAM_COLORS[site.languages[0]] ?? '#495057'
      siteLabels.addLayer(lf.tooltip({ permanent: true, direction: 'right', offset: [12, 0], className: 'site-label', pane: 'labels', interactive: false })
        .setLatLng(ll).setContent(tip))
    }
    rings.addTo(m)
    const moves = scenario === 'sq' ? [] : programMoves(scenario, { scenarioSchools: d.schools, sqSchools: datasets[`sq_${band}`]?.schools })
    const arrows = lf.layerGroup().addTo(m)
    const draw = () => {
      arrows.clearLayers()
      for (const mv of moves) for (const l of arrowLayers(lf, m, mv) ?? []) arrows.addLayer(l)
      const on = m.getZoom() >= 12
      if (on && !m.hasLayer(siteLabels)) siteLabels.addTo(m)
      if (!on && m.hasLayer(siteLabels)) m.removeLayer(siteLabels)
    }
    draw()
    m.on('zoomend', draw)
    return () => {
      m.off('zoomend', draw)
      for (const l of [rings, arrows, siteLabels]) m.removeLayer(l)
    }
  }, [ready, datasets, scenario, band, programs])

  // Selected point: pin it, and move the map to it when it came from an address search or a shared link.
  useEffect(() => {
    const lf = L.current, m = map.current
    if (!ready || !lf || !m || !position) return
    if (pin.current) pin.current.setLatLng(position)
    else pin.current = lf.marker(position, { keyboard: false, icon: lf.divIcon({ className: 'pin', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(m)
    if (focusSelection) {
      fitted.current = true
      m.setView(position, Math.max(m.getZoom(), 14), { animate: false })
      // lift the pin out from under the panel (side panel on desktop, bottom sheet on phones)
      m.panBy([-panelInset.left / 2, panelInset.bottom / 2], { animate: false })
    }
  }, [ready, position, focusSelection])

  return (
    <div className="map-wrap">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <pattern id="hatch-change" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
            <rect width="7" height="7" fill="#17232c" fillOpacity="0.06" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#17232c" strokeWidth="2" strokeOpacity="0.45" />
          </pattern>
        </defs>
      </svg>
      <div ref={container} className="map" aria-label="Map of attendance boundaries. Click to compare schools at a location." />
      {error && <p className="map-error" role="alert">{error}</p>}
    </div>
  )
}
