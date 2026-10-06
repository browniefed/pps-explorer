import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react'
import type { FeatureCollection } from 'geojson'
import { BoundaryMap, CLUSTERS, type Layer } from '../components/BoundaryMap'
import { assignmentsAt, bands, scenarios, shortName, type Assignment, type Band, type Scenario } from '../lib/assignments.mjs'

export const Route = createFileRoute('/')({ component: Home })

const SCENARIO_NAMES: Record<Scenario, string> = { sq: 'Status quo', a: 'Scenario A', b: 'Scenario B' }
const BAND_NAMES: Record<Band, string> = { k5: 'K–5', '68': '6–8', '912': '9–12' }
// source PDFs in public/maps use these names
const PDF_SCENARIO: Record<Scenario, string> = { sq: 'current', a: 'a', b: 'b' }
const PDF_BAND: Record<Band, string> = { k5: 'elementary', '68': 'middle', '912': 'high' }
const PPS_DOCUMENTS = 'https://meetings.boardbook.org/Public/Agenda/915?meeting=769955'
const MOBILE = '(max-width: 720px)'

// Phone bottom sheet: peek shows the title and scenario switch; half and full reveal the rest.
type Sheet = 'peek' | 'half' | 'full'
const sheetHeights = (peek: number, vh: number): Record<Sheet, number> => ({ peek, half: Math.round(vh * 0.5), full: Math.round(vh * 0.88) })

type HashState = { scenario: Scenario; band: Band; compare: boolean; position: [number, number] | null }

function readHash(): Partial<HashState> {
  const h = new URLSearchParams(window.location.hash.slice(1))
  const out: Partial<HashState> = { compare: h.get('cmp') === '1' }
  const s = h.get('s'), g = h.get('g')
  if (s && s in SCENARIO_NAMES) out.scenario = s as Scenario
  if (g && g in BAND_NAMES) out.band = g as Band
  const pt = (h.get('pt') ?? '').split(',').map(Number)
  if (pt.length === 2 && pt.every(Number.isFinite)) out.position = [pt[0], pt[1]]
  return out
}

function writeHash({ scenario, band, compare, position }: HashState) {
  const parts = [`s=${scenario}`, `g=${band}`]
  if (compare) parts.push('cmp=1')
  if (position) parts.push(`pt=${position[0].toFixed(5)},${position[1].toFixed(5)}`)
  window.history.replaceState(null, '', '#' + parts.join('&'))
}

function Segmented<T extends string>({ label, value, keys, options, onChange, large }: {
  label: string; value: T; keys: readonly T[]; options: Record<T, string>; onChange: (v: T) => void; large?: boolean
}) {
  // arrow keys move within the group, like native radio buttons
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const i = keys.indexOf(value)
    const next = keys[(i + (e.key === 'ArrowRight' ? 1 : keys.length - 1)) % keys.length]
    onChange(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-v="${next}"]`)?.focus()
  }
  return (
    <div className="control">
      <span className="control-label" id={`${label}-label`}>{label}</span>
      <div className={large ? 'seg seg-large' : 'seg'} role="radiogroup" aria-labelledby={`${label}-label`} onKeyDown={onKeyDown}>
        {keys.map((k) => (
          <button key={k} type="button" role="radio" data-v={k} aria-checked={value === k} tabIndex={value === k ? 0 : -1} onClick={() => onChange(k)}>
            {options[k]}
          </button>
        ))}
      </div>
    </div>
  )
}

function Cell({ a }: { a: Assignment }) {
  const name = a.school ? shortName(a.school) : a.status === 'ambiguous' ? 'Overlapping areas' : 'Outside district'
  const cls = [a.changed ? 'changed' : '', a.school ? '' : 'none'].filter(Boolean).join(' ')
  return (
    <td className={cls || undefined} title={a.status === 'near-boundary' ? 'This spot is on a boundary line; nearest area shown.' : undefined}>
      {name}{a.status === 'near-boundary' && ' *'}
    </td>
  )
}

function Home() {
  const [scenario, setScenario] = useState<Scenario>('sq')
  const [band, setBand] = useState<Band>('k5')
  const [compare, setCompare] = useState(false)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [focusSelection, setFocusSelection] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [datasets, setDatasets] = useState<Record<string, Layer> | null>(null)
  const [dataError, setDataError] = useState(false)
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [searchMsg, setSearchMsg] = useState('Or click anywhere on the map.')
  const [mobile, setMobile] = useState(false)
  const [sheet, setSheet] = useState<Sheet>('half')
  const [peekHeight, setPeekHeight] = useState(150)
  const [viewportHeight, setViewportHeight] = useState(800)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const [sideInset, setSideInset] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const panel = useRef<HTMLElement>(null)
  const sheetTop = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number; startHeight: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const heights = sheetHeights(peekHeight, viewportHeight)
  // map area hidden by the panel: the side panel on desktop, the sheet (at peek or half) on phones
  const panelInset = mobile ? { left: 0, bottom: sheet === 'peek' ? peekHeight : heights.half } : { left: sideInset, bottom: 0 }
  const body = useRef<HTMLDivElement>(null)
  useEffect(() => { if (sheet === 'peek' && body.current) body.current.scrollTop = 0 }, [sheet])

  // Track phone layout and the sizes the sheet snaps to.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE)
    const measure = () => {
      setMobile(mq.matches)
      setViewportHeight(window.innerHeight)
      if (sheetTop.current) setPeekHeight(sheetTop.current.offsetHeight)
      if (!mq.matches && panel.current) setSideInset(panel.current.getBoundingClientRect().right)
    }
    measure()
    mq.addEventListener('change', measure)
    window.addEventListener('resize', measure)
    return () => { mq.removeEventListener('change', measure); window.removeEventListener('resize', measure) }
  }, [])

  const onGrabDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!mobile || !panel.current) return
    drag.current = { startY: e.clientY, startHeight: panel.current.offsetHeight, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onGrabMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dy = d.startY - e.clientY
    if (Math.abs(dy) > 6) d.moved = true
    if (d.moved) setDragHeight(Math.min(heights.full, Math.max(heights.peek, d.startHeight + dy)))
  }
  const onGrabUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    // a drag ends in a snap to the nearest stop, nudged in the direction of travel
    const h = Math.min(heights.full, Math.max(heights.peek, d.startHeight + (d.startY - e.clientY)))
    const dir = Math.sign(d.startY - e.clientY)
    const target = (Object.keys(heights) as Sheet[]).reduce((best, k) =>
      Math.abs(heights[k] - h - dir * 40) < Math.abs(heights[best] - h - dir * 40) ? k : best, 'peek' as Sheet)
    setSheet(target)
    setDragHeight(null)
    suppressClick.current = true
  }
  // Tapping the grab area (or Enter on its button) toggles between peek and half.
  const onGrabClick = () => {
    if (suppressClick.current) { suppressClick.current = false; return }
    if (mobile) setSheet((s) => (s === 'peek' ? 'half' : 'peek'))
  }

  // URL hash holds the view so a lookup can be shared as a link.
  useEffect(() => {
    const h = readHash()
    if (h.scenario) setScenario(h.scenario)
    if (h.band) setBand(h.band)
    setCompare(!!h.compare)
    if (h.position) { setPosition(h.position); setFocusSelection(true); setLocationName('Shared location') }
    if (window.matchMedia(MOBILE).matches && !h.position) setSheet('peek')
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) writeHash({ scenario, band, compare, position }) }, [hydrated, scenario, band, compare, position])

  useEffect(() => {
    const controller = new AbortController()
    const get = async (url: string) => {
      const r = await fetch(url, { signal: controller.signal })
      if (!r.ok) throw Error(url)
      return (await r.json()) as FeatureCollection
    }
    Promise.all(scenarios.flatMap((s) => bands.map(async (b) => {
      const key = `${s}_${b}`
      const [areas, schools] = await Promise.all([get(`/data/${key}.geojson`), get(`/data/${key}_schools.geojson`)])
      return [key, { areas, schools }] as const
    })))
      .then((entries) => setDatasets(Object.fromEntries(entries)))
      .catch((e) => { if (e.name !== 'AbortError') setDataError(true) })
    return () => controller.abort()
  }, [])

  const select = useCallback((point: [number, number]) => {
    setPosition(point)
    setFocusSelection(false)
    setLocationName('')
    setSheet((s) => (s === 'peek' ? 'half' : s))
  }, [])

  const areas = datasets && Object.fromEntries(Object.entries(datasets).map(([k, v]) => [k, v.areas]))
  const results = position && areas ? assignmentsAt(areas, [position[1], position[0]]) : null
  const anyNear = results ? scenarios.some((s) => bands.some((b) => results[s][b].status === 'near-boundary')) : false

  async function search(e: FormEvent) {
    e.preventDefault()
    if (!address.trim()) return
    setBusy(true)
    setSearchMsg('Searching…')
    try {
      const url = new URL('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates')
      url.search = new URLSearchParams({
        f: 'json', SingleLine: address, searchExtent: '-122.95,45.4,-122.45,45.75', outSR: '4326',
        maxLocations: '1', outFields: 'Match_addr', forStorage: 'false',
      }).toString()
      const r = await fetch(url, { signal: AbortSignal.timeout(12000) })
      if (!r.ok) throw Error()
      const hit = (await r.json()).candidates?.[0]
      if (!hit || hit.score < 90) throw Error()
      const { x, y } = hit.location
      if (x < -122.95 || x > -122.45 || y < 45.4 || y > 45.75) throw Error()
      setPosition([y, x])
      setFocusSelection(true)
      setLocationName(hit.address)
      setSearchMsg(hit.address)
      setSheet((s) => (s === 'peek' ? 'half' : s))
    } catch {
      setSearchMsg('No confident match in Portland. Add the ZIP code, or click the map.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main>
      <BoundaryMap datasets={datasets} scenario={scenario} band={band} compare={compare} position={position}
        focusSelection={focusSelection} panelInset={panelInset} onSelect={select} />

      <aside className={dragHeight !== null ? 'panel dragging' : 'panel'} ref={panel} data-sheet={mobile ? sheet : undefined}
        style={mobile ? { height: dragHeight ?? heights[sheet] } : undefined}>
        <div className="sheet-top" ref={sheetTop}>
          {/* drag zone: handle + title. Never scrolls away, so the sheet can always be moved. */}
          <div className="sheet-grab" onPointerDown={onGrabDown} onPointerMove={onGrabMove} onPointerUp={onGrabUp}
            onPointerCancel={() => { drag.current = null; setDragHeight(null) }} onClick={onGrabClick}>
            <button className="sheet-handle" type="button" aria-expanded={sheet !== 'peek'}
              aria-label={sheet === 'peek' ? 'Show map controls' : 'Hide map controls'} />
            <header>
              <h1>PPS attendance boundaries</h1>
              <p className="sub">Proposed scenarios for school year 2027–28</p>
            </header>
          </div>
          <Segmented label="Scenario" value={scenario} keys={scenarios} options={SCENARIO_NAMES} onChange={setScenario} large />
        </div>

        <div className="panel-body" ref={body} inert={mobile && sheet === 'peek' && dragHeight === null}>
        <Segmented label="Grades" value={band} keys={bands} options={BAND_NAMES} onChange={setBand} />

        <label className="check">
          <input type="checkbox" checked={compare} disabled={scenario === 'sq'} onChange={(e) => setCompare(e.target.checked)} />
          <span>Show status quo lines on top (dotted)</span>
        </label>

        <form className="search" role="search" onSubmit={search}>
          <label htmlFor="address" className="control-label">Look up an address</label>
          <div className="search-row">
            <input id="address" type="search" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 1234 SE Division St" autoComplete="street-address" maxLength={240} />
            <button type="submit" disabled={busy}>{busy ? 'Finding…' : 'Find'}</button>
          </div>
          <p className="hint" aria-live="polite">{searchMsg}</p>
        </form>

        {dataError && <p className="error" role="alert">Boundary data failed to load. Reload the page to try again.</p>}

        {results && (
          <section className="lookup" aria-live="polite">
            <h2>Schools at this spot</h2>
            {locationName && <p className="hint location-name">{locationName}</p>}
            <table>
              <thead><tr><th /><th scope="col">K–5</th><th scope="col">6–8</th><th scope="col">9–12</th></tr></thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s} className={s === scenario ? 'current' : undefined}>
                    <th scope="row">{s === 'sq' ? 'Status quo' : SCENARIO_NAMES[s].replace('Scenario ', 'Scen. ')}</th>
                    {bands.map((b) => <Cell key={b} a={results[s][b]} />)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hint">Highlighted cells differ from status quo.</p>
            {anyNear && <p className="hint">* This spot sits on a boundary line, so the nearest area is shown. Check with PPS.</p>}
          </section>
        )}

        <section className="legend">
          <h2>High school cluster</h2>
          <ul>
            {Object.entries(CLUSTERS).map(([name, color]) => (
              <li key={name}><span className="swatch" style={{ background: color }} />{name}</li>
            ))}
          </ul>
        </section>

        <footer>
          <h2>Sources</h2>
          <ul className="sources">
            <li><a href={PPS_DOCUMENTS} target="_blank" rel="noreferrer">PPS board documents (agenda item 8)</a></li>
            {scenarios.map((s) => (
              <li key={s}>
                <a href={`/maps/${PDF_SCENARIO[s]}-${PDF_BAND[band]}.pdf`} target="_blank" rel="noreferrer">
                  {SCENARIO_NAMES[s]} {BAND_NAMES[band]} map (PDF)
                </a>
              </li>
            ))}
          </ul>
          <p>
            Boundaries are traced from the vector paths in PPS’s scenario PDFs (rightsizing model 2026.09.24) and placed using the
            PDFs’ own embedded map coordinates, so positions are accurate to a few metres. Area names come from the school
            labels on each map. Confirm addresses near a boundary with PPS; lottery and immersion placements are separate.
          </p>
          <p>Address searches go straight from your browser to Esri’s geocoder and aren’t saved by this site.</p>
        </footer>
        </div>
      </aside>
    </main>
  )
}
