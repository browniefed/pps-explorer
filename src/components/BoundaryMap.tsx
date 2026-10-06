import { useEffect, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson'
import type { Band, Scenario } from '../lib/assignments.mjs'

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

export type Layer = { areas: FeatureCollection; schools: FeatureCollection }

type Props = {
  datasets: Record<string, Layer> | null
  scenario: Scenario
  band: Band
  compare: boolean
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

const mapLabel = (name: string) => name.replace(/ Elementary$/, '')

export function BoundaryMap({ datasets, scenario, band, compare, position, focusSelection, panelInset, onSelect }: Props) {
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
      for (const [name, z] of [['areas', 400], ['compare', 450], ['schools', 600], ['reference', 620], ['labels', 650]] as const) {
        m.createPane(name).style.zIndex = String(z)
      }
      m.getPane('reference')!.style.pointerEvents = 'none'
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
    const style = (f?: Feature): Leaflet.PathOptions => ({
      pane: 'areas',
      color: hs ? '#00538b' : '#26323b',
      weight: hs ? 3 : 1.5,
      opacity: 0.85,
      fillColor: CLUSTERS[f?.properties?.cluster] ?? '#888',
      fillOpacity: 0.22,
      dashArray: f?.properties?.level === 'K-8' ? '6 4' : undefined,
    })
    const areas: Leaflet.GeoJSON = lf.geoJSON(d.areas, {
      style,
      onEachFeature(f, layer) {
        const p = f.properties ?? {}
        const tip = document.createElement('span')
        const strong = document.createElement('strong')
        strong.textContent = p.name
        tip.append(strong, document.createElement('br'), `${p.cluster} cluster · ${p.area_sqmi} sq mi`)
        layer.bindTooltip(tip, { sticky: true, className: 'hover-tip' })
        layer.on('mouseover', () => (layer as Leaflet.Path).setStyle({ fillOpacity: 0.42, weight: hs ? 4 : 2.5 }))
        layer.on('mouseout', () => areas.resetStyle(layer))
      },
    }).addTo(m)
    const added: Leaflet.Layer[] = [areas]

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
        return lf.circleMarker(ll, {
          pane: 'schools',
          radius: kind === 'closed' ? 4 : 5,
          color: kind === 'closed' ? '#7a8691' : '#17232c',
          weight: 1.5,
          fillColor: kind === 'focus' ? '#6b1f3d' : '#ffffff',
          fillOpacity: 1,
        }).bindTooltip(String(f.properties?.name ?? ''), { className: 'hover-tip' })
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
      <div ref={container} className="map" aria-label="Map of attendance boundaries. Click to compare schools at a location." />
      {error && <p className="map-error" role="alert">{error}</p>}
    </div>
  )
}
