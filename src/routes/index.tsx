import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react'
import type { FeatureCollection } from 'geojson'
import { BoundaryMap, CLUSTERS, type DliReach, type Layer } from '../components/BoundaryMap'
import { assignmentsAt, bands, scenarios, shortName, type Assignment, type Band, type Scenario } from '../lib/assignments.mjs'
import { describe, digest, programName, schoolKey, spotNotes, type ChangeEvent } from '../lib/changes.mjs'
import { SUMMARY } from '../lib/changes-data.mjs'
import { initialLang, LANGS, list, LOCALES, memoText, pct as fmtPct, t, type Lang } from '../lib/i18n.mjs'
import { PROGRAM_COLORS } from '../lib/programs.mjs'

export const Route = createFileRoute('/')({ component: Home })

const BAND_NAMES: Record<Band, string> = { k5: 'K–5', '68': '6–8', '912': '9–12' }
// source PDFs in public/maps use these names
const PDF_SCENARIO: Record<Scenario, string> = { sq: 'current', a: 'a', b: 'b' }
const PDF_BAND: Record<Band, string> = { k5: 'elementary', '68': 'middle', '912': 'high' }
const PPS_DOCUMENTS = 'https://meetings.boardbook.org/Public/Agenda/915?meeting=769955'
const MOBILE = '(max-width: 720px)'

// Phone bottom sheet: peek shows the title and scenario switch; half and full reveal the rest.
type Sheet = 'peek' | 'half' | 'full'
const sheetHeights = (peek: number, vh: number): Record<Sheet, number> => ({ peek, half: Math.round(vh * 0.5), full: Math.round(vh * 0.88) })

type HashState = { scenario: Scenario; band: Band; compare: boolean; programs: boolean; changes: boolean; dliReach: boolean; lang: Lang; position: [number, number] | null }
type HashRead = Partial<Omit<HashState, 'lang'>> & { lang?: string | null }

function readHash(): HashRead {
  const h = new URLSearchParams(window.location.hash.slice(1))
  const out: HashRead = { compare: h.get('cmp') === '1', programs: h.get('imm') !== '0', changes: h.get('chg') !== '0', dliReach: h.get('dli') === '1', lang: h.get('lang') }
  const s = h.get('s'), g = h.get('g')
  if (s && (scenarios as readonly string[]).includes(s)) out.scenario = s as Scenario
  if (g && g in BAND_NAMES) out.band = g as Band
  const pt = (h.get('pt') ?? '').split(',').map(Number)
  if (pt.length === 2 && pt.every(Number.isFinite)) out.position = [pt[0], pt[1]]
  return out
}

function writeHash({ scenario, band, compare, programs, changes, dliReach, lang, position }: HashState) {
  const parts = [`s=${scenario}`, `g=${band}`]
  if (compare) parts.push('cmp=1')
  if (!programs) parts.push('imm=0')
  if (!changes) parts.push('chg=0')
  if (dliReach) parts.push('dli=1')
  if (lang !== 'en') parts.push(`lang=${lang}`)
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

function Cell({ a, lang }: { a: Assignment; lang: Lang }) {
  const name = a.status === 'unclear' && a.school && a.alternatives
    ? t(lang, 'cellOr', { a: shortName(a.alternatives[0]).replace(/ K-8$/, ''), b: shortName(a.school) })
    : a.school ? shortName(a.school) : t(lang, a.status === 'ambiguous' ? 'cellOverlap' : 'cellOutside')
  const cls = [a.changed ? 'changed' : '', a.school ? '' : 'none'].filter(Boolean).join(' ')
  return (
    <td className={cls || undefined} title={a.status === 'near-boundary' ? t(lang, 'cellNearTitle')
      : a.status === 'unclear' ? t(lang, 'cellUnclearTitle') : undefined}>
      {name}{a.status === 'near-boundary' && ' *'}
    </td>
  )
}


// School names in a change list are buttons that jump to that school on the map.
function SchoolLinks({ names, onGo, lang }: { names: string[]; onGo: (name: string) => void; lang: Lang }) {
  const { and, sep } = LOCALES[lang]
  return <>{names.map((n, i) => (
    <span key={n}>{i > 0 && (i === names.length - 1 ? and : sep)}<button type="button" className="link" onClick={() => onGo(n)}>{n}</button></span>
  ))}</>
}

function ChangeItem({ e, onGo, lang }: { e: ChangeEvent; onGo: (name: string) => void; lang: Lang }) {
  const detail = e.kind === 'close' || e.kind === 'program' ? memoText(e, 'detail', lang) : undefined
  switch (e.kind) {
    case 'close':
      return <li><SchoolLinks names={[e.school]} onGo={onGo} lang={lang} />{e.to && <> → <SchoolLinks names={e.to} onGo={onGo} lang={lang} /></>}{detail && <span className="detail"> {detail}</span>}</li>
    case 'program': {
      const name = t(lang, 'programTitle', { program: programName(e.program, lang) })
      return <li>{name}: <SchoolLinks names={e.from} onGo={onGo} lang={lang} /> → <SchoolLinks names={[e.to]} onGo={onGo} lang={lang} />{detail && <span className="detail"> {detail}</span>}</li>
    }
    case 'grades':
      return <li><SchoolLinks names={[e.school]} onGo={onGo} lang={lang} /> 6–8 → <SchoolLinks names={[e.to]} onGo={onGo} lang={lang} /></li>
    default:
      return <li>{describe(e, undefined, lang)}</li>
  }
}

function Changes({ scenario, onGo, lang }: { scenario: Scenario; onGo: (name: string) => void; lang: Lang }) {
  const sum = SUMMARY[scenario]
  const p = (x: number) => fmtPct(lang, x)
  if (scenario === 'sq') {
    return (
      <section className="changes">
        <h2>{t(lang, 'changesTitleSq')}</h2>
        <p className="hint">{t(lang, 'changesSq', { share: p(sum.studentsInSustainableSchools) })}</p>
      </section>
    )
  }
  const d = digest(scenario)
  const groups: [string, ChangeEvent[]][] = [
    [t(lang, 'groupClosing', { n: d.closures.length }), d.closures],
    [t(lang, 'groupPrograms'), d.programs],
    [t(lang, 'groupGrades'), d.grades],
    [t(lang, 'groupOther'), d.notes],
  ]
  return (
    <section className="changes">
      <h2>{t(lang, 'changesTitle', { scenario: t(lang, `scenario.${scenario}`) })}</h2>
      <p className="hint">
        {t(lang, 'changesSummary', { closures: sum.closures, boundary: sum.boundaryChanges, moving: p(sum.studentsChangingSchools),
          share: p(sum.studentsInSustainableSchools), sqShare: p(SUMMARY.sq.studentsInSustainableSchools) })}
      </p>
      {groups.map(([title, events]) => events.length > 0 && (
        <details key={title}>
          <summary>{title}</summary>
          <ul className="change-list">{events.map((e, i) => <ChangeItem key={i} e={e} onGo={onGo} lang={lang} />)}</ul>
        </details>
      ))}
      <p className="hint">{t(lang, 'changesSource')}</p>
    </section>
  )
}

// Share of PPS land within 1 mile (straight line) of a Spanish DLI elementary school, 2022 to the scenario shown.
function DliSummary({ dli, scenario, lang }: { dli: DliReach; scenario: Scenario; lang: Lang }) {
  const rows: [string, '2022' | Scenario][] = [['2022', '2022'], [t(lang, 'dliToday'), 'sq']]
  if (scenario !== 'sq') rows.push([t(lang, `scenario.${scenario}`), scenario])
  const now = new Set(dli.periods[scenario].sites.map((x) => x.name))
  const lost = dli.periods['2022'].sites.filter((x) => !now.has(x.name)).map((x) => x.name.replace(' Creative Science', ''))
  const when = scenario === 'sq' ? t(lang, 'dliWhenToday') : t(lang, 'dliWhenIn', { scenario: t(lang, `scenario.${scenario}`) })
  return (
    <div className="program-key dli-key">
      <ul>
        <li className="wide"><span className="ring dli-ring" />{t(lang, 'dliNow', { when })}</li>
        <li className="wide"><span className="ring dli-lost" />{t(lang, 'dliLost', { when, lost: list(lang, lost) })}</li>
      </ul>
      <table className="dli-table">
        <thead><tr><th scope="col">{t(lang, 'dliPeriod')}</th><th scope="col">{t(lang, 'dliSchools')}</th><th scope="col">{t(lang, 'dliWithin')}</th></tr></thead>
        <tbody>
          {rows.map(([label, p]) => (
            <tr key={p}><th scope="row">{label}</th><td>{dli.periods[p].sites.length}</td><td>{fmtPct(lang, dli.periods[p].reach_share)} ({t(lang, 'dliSqMi', { n: dli.periods[p].reach_sq_mi })})</td></tr>
          ))}
        </tbody>
      </table>
      <p className="hint">{t(lang, 'dliNote')}</p>
    </div>
  )
}

function Home() {
  const [scenario, setScenario] = useState<Scenario>('sq')
  const [lang, setLang] = useState<Lang>('en')
  const [band, setBand] = useState<Band>('k5')
  const [compare, setCompare] = useState(false)
  const [programs, setPrograms] = useState(true)
  const [changes, setChanges] = useState(true)
  const [dliReach, setDliReach] = useState(false)
  const [dli, setDli] = useState<DliReach | null>(null)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [focusSelection, setFocusSelection] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [datasets, setDatasets] = useState<Record<string, Layer> | null>(null)
  const [dataError, setDataError] = useState(false)
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [searchMsg, setSearchMsg] = useState<{ key: string } | { text: string }>({ key: 'searchHint' })
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
    setPrograms(h.programs !== false)
    setChanges(h.changes !== false)
    setDliReach(!!h.dliReach)
    setLang(initialLang(h.lang, navigator.languages))
    if (h.position) { setPosition(h.position); setFocusSelection(true); setLocationName('@sharedLocation') }
    if (window.matchMedia(MOBILE).matches && !h.position) setSheet('peek')
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) writeHash({ scenario, band, compare, programs, changes, dliReach, lang, position }) }, [hydrated, scenario, band, compare, programs, changes, dliReach, lang, position])
  // screen readers pronounce the page in the chosen language
  useEffect(() => { document.documentElement.lang = lang }, [lang])

  useEffect(() => {
    const controller = new AbortController()
    const get = async (url: string) => {
      const r = await fetch(url, { signal: controller.signal })
      if (!r.ok) throw Error(url)
      return (await r.json()) as FeatureCollection
    }
    Promise.all(scenarios.flatMap((s) => bands.map(async (b) => {
      const key = `${s}_${b}`
      const [areas, schools, changed] = await Promise.all([
        get(`/data/${key}.geojson`), get(`/data/${key}_schools.geojson`),
        s === 'sq' ? Promise.resolve(undefined) : get(`/data/${key}_changed.geojson`),
      ])
      return [key, { areas, schools, changed }] as const
    })))
      .then((entries) => setDatasets(Object.fromEntries(entries)))
      .catch((e) => { if (e.name !== 'AbortError') setDataError(true) })
    // optional overlay data: if it fails, the setting simply has nothing to show
    fetch('/data/dli_reach.json', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DliReach | null) => setDli(d))
      .catch(() => {})
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
  // which schools have an attendance area on each map, to explain schools that stay open without one
  const areaNames = useMemo(() => Object.fromEntries(Object.entries(datasets ?? {}).map(([k, v]) =>
    [k, new Set(v.areas.features.map((f) => schoolKey(String(f.properties?.name ?? ''))))])), [datasets])
  // map label per school, so notes can say what an area-less school keeps ("Rigler K-5 Spanish Immersion")
  const labels = useMemo(() => Object.fromEntries(Object.entries(datasets ?? {}).map(([k, v]) =>
    [k, Object.fromEntries(v.schools.features.map((f) => [schoolKey(String(f.properties?.name ?? '')), String(f.properties?.name ?? '')]))])), [datasets])
  const notes = spotNotes(scenario, results, areaNames, labels, lang)

  // Jump to a school named in the change lists: select its location so the lookup explains it.
  const goToSchool = (name: string) => {
    if (!datasets) return
    const key = schoolKey(name)
    for (const k of [`${scenario}_k5`, `${scenario}_68`, `sq_k5`, `sq_68`, `sq_912`]) {
      const f = datasets[k]?.schools.features.find((x) => schoolKey(String(x.properties?.name ?? '')) === key)
      if (f && f.geometry.type === 'Point') {
        const [lng, lat] = f.geometry.coordinates
        setPosition([lat, lng])
        setFocusSelection(true)
        setLocationName(`@school:${name}`)
        setSheet((s) => (s === 'peek' ? 'half' : s))
        body.current?.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }
  }

  async function search(e: FormEvent) {
    e.preventDefault()
    if (!address.trim()) return
    setBusy(true)
    setSearchMsg({ key: 'searching' })
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
      setSearchMsg({ text: hit.address })
      setSheet((s) => (s === 'peek' ? 'half' : s))
    } catch {
      setSearchMsg({ key: 'searchNoMatch' })
    } finally {
      setBusy(false)
    }
  }

  const tr = (key: string, vars?: Record<string, unknown>) => t(lang, key, vars)
  const scenarioNames = Object.fromEntries(scenarios.map((s) => [s, tr(`scenario.${s}`)])) as Record<Scenario, string>
  const shownLocation = locationName === '@sharedLocation' ? tr('sharedLocation')
    : locationName.startsWith('@school:') ? tr('schoolLocation', { name: locationName.slice(8) }) : locationName

  return (
    <main>
      <BoundaryMap datasets={datasets} scenario={scenario} band={band} compare={compare} programs={programs} changes={changes} lang={lang} dli={dli} dliReach={dliReach} position={position}
        focusSelection={focusSelection} panelInset={panelInset} onSelect={select} />

      <aside className={dragHeight !== null ? 'panel dragging' : 'panel'} ref={panel} data-sheet={mobile ? sheet : undefined}
        style={mobile ? { height: dragHeight ?? heights[sheet] } : undefined}>
        <div className="sheet-top" ref={sheetTop}>
          {/* drag zone: handle + title. Never scrolls away, so the sheet can always be moved. */}
          <div className="sheet-grab" onPointerDown={onGrabDown} onPointerMove={onGrabMove} onPointerUp={onGrabUp}
            onPointerCancel={() => { drag.current = null; setDragHeight(null) }} onClick={onGrabClick}>
            <button className="sheet-handle" type="button" aria-expanded={sheet !== 'peek'}
              aria-label={tr(sheet === 'peek' ? 'sheetShow' : 'sheetHide')} />
            <header>
              <h1>{tr('title')}</h1>
              <p className="sub">{tr('subtitle')}</p>
            </header>
          </div>
          {/* outside the drag zone so the links are tappable on phones */}
          <div className="meta-row">
            <p className="contact">
              {tr('contact')}{' '}
              <a href="mailto:browniefed@gmail.com?subject=PPS%20School%20Explorer">browniefed@gmail.com</a>
            </p>
            <label className="lang-picker">
              <span className="visually-hidden">{tr('languageLabel')}{lang !== 'en' && ' / Language'}</span>
              <select value={lang} onChange={(ev) => setLang(ev.target.value as Lang)}>
                {(Object.keys(LANGS) as Lang[]).map((l) => <option key={l} value={l} lang={l}>{LANGS[l]}</option>)}
              </select>
            </label>
          </div>
          {!LOCALES[lang].reviewed && <p className="translation-note">{tr('translationNote')}</p>}
          <Segmented label={tr('scenarioLabel')} value={scenario} keys={scenarios} options={scenarioNames} onChange={setScenario} large />
        </div>

        <div className="panel-body" ref={body} inert={mobile && sheet === 'peek' && dragHeight === null}>
        <p className="hint scenario-hint">{tr('scenarioHint')}</p>
        <details className="howto" open={!position}>
          <summary>{tr('howToTitle')}</summary>
          <ol>
            <li>{tr('howTo1')}</li>
            <li>{tr('howTo2')}</li>
            <li>{tr('howTo3')}</li>
          </ol>
        </details>
        <Segmented label={tr('gradesLabel')} value={band} keys={bands} options={BAND_NAMES} onChange={setBand} />

        <label className="check">
          <input type="checkbox" checked={compare} disabled={scenario === 'sq'} onChange={(e) => setCompare(e.target.checked)} />
          <span>{tr('compareToggle')}</span>
        </label>

        <label className="check">
          <input type="checkbox" checked={changes} disabled={scenario === 'sq'} onChange={(e) => setChanges(e.target.checked)} />
          <span>{tr('changesToggle')}</span>
        </label>
        {changes && scenario !== 'sq' && (
          <div className="program-key">
            <ul>
              <li className="wide"><span className="hatch-swatch" />{tr('changesKeyHatch')}</li>
              <li className="wide"><span className="closed-swatch">×</span>{tr('changesKeyClosed')}</li>
            </ul>
          </div>
        )}

        <label className="check">
          <input type="checkbox" checked={programs} onChange={(e) => setPrograms(e.target.checked)} />
          <span>{tr('programsToggle', { moves: scenario !== 'sq' })}</span>
        </label>
        {programs && (
          <div className="program-key">
            <ul>
              {Object.entries(PROGRAM_COLORS).filter(([k]) => scenario !== 'sq' || !['Deaf and Hard of Hearing', 'Odyssey'].includes(k)).map(([k, color]) => (
                <li key={k}><span className="ring" style={{ borderColor: color }} />{tr(`lang.${k}`)}</li>
              ))}
              <li className="wide"><span className="ring dashed" />{tr('immersionOnly')}</li>
            </ul>
            <p className="hint">
              {tr('programsHint', { moves: scenario !== 'sq' })}
              {band === 'k5' && scenario !== 'sq' && ' ' + tr('programsK5Note')}
            </p>
          </div>
        )}

        <label className="check">
          <input type="checkbox" checked={dliReach} onChange={(e) => setDliReach(e.target.checked)} />
          <span>{tr('dliToggle')}</span>
        </label>
        {dliReach && dli && <DliSummary dli={dli} scenario={scenario} lang={lang} />}

        <form className="search" role="search" onSubmit={search}>
          <label htmlFor="address" className="control-label">{tr('searchLabel')}</label>
          <div className="search-row">
            <input id="address" type="search" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder={tr('searchPlaceholder')} autoComplete="street-address" maxLength={240} />
            <button type="submit" disabled={busy}>{tr(busy ? 'finding' : 'find')}</button>
          </div>
          <p className="hint" aria-live="polite">{'key' in searchMsg ? tr(searchMsg.key) : searchMsg.text}</p>
        </form>

        {dataError && <p className="error" role="alert">{tr('dataError')}</p>}

        {results && (
          <section className="lookup" aria-live="polite">
            <h2>{tr('lookupTitle')}</h2>
            {shownLocation && <p className="hint location-name">{shownLocation}</p>}
            <table>
              <thead><tr><th /><th scope="col">K–5</th><th scope="col">6–8</th><th scope="col">9–12</th></tr></thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s} className={s === scenario ? 'current' : undefined}>
                    <th scope="row">{tr(`scenarioShort.${s}`)}</th>
                    {bands.map((b) => <Cell key={b} a={results[s][b]} lang={lang} />)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hint">{tr('lookupChanged')}</p>
            {anyNear && <p className="hint">{tr('lookupNear')}</p>}
            {scenario === 'sq'
              ? <p className="hint">{tr('lookupChooseScenario')}</p>
              : notes.length > 0 && (
                <div className="spot-notes">
                  <h3>{tr('lookupNotesTitle', { scenario: scenarioNames[scenario] })}</h3>
                  <ul>{notes.map((n) => <li key={n.school + n.text}><strong>{n.school}:</strong> {n.text}</li>)}</ul>
                </div>
              )}
          </section>
        )}

        <Changes scenario={scenario} onGo={goToSchool} lang={lang} />

        <section className="timeline">
          <h2>{tr('timelineTitle')}</h2>
          <ol>
            {(['timeline1', 'timeline2', 'timeline3', 'timeline4', 'timeline5'] as const).map((k) => {
              const [when, what] = t(lang, k) as unknown as [string, string]
              return <li key={k}><strong>{when}</strong> {what}</li>
            })}
          </ol>
          <p className="hint">{tr('timelineNote')}</p>
          <h3>{tr('feedbackTitle')}</h3>
          <ul className="sources">
            <li>{tr('feedbackEmail')} <a href="mailto:Rightsizing@pps.net">Rightsizing@pps.net</a></li>
            <li><a href="https://www.pps.net/rightsizing-rsvp" target="_blank" rel="noreferrer">{tr('feedbackRsvp')}</a></li>
            <li><a href="https://www.pps.net/about/portland-public-schools-information/rightsize/frequently-asked-questions" target="_blank" rel="noreferrer">{tr('feedbackFaq')}</a> {tr('feedbackFaqNote')}</li>
          </ul>
        </section>

        <section className="legend">
          <h2>{tr('clusterTitle')}</h2>
          <ul>
            {Object.entries(CLUSTERS).map(([name, color]) => (
              <li key={name}><span className="swatch" style={{ background: color }} />{name}</li>
            ))}
          </ul>
        </section>

        <footer>
          <h2>{tr('sourcesTitle')}</h2>
          <ul className="sources">
            <li><a href={PPS_DOCUMENTS} target="_blank" rel="noreferrer">{tr('sourceBoard')}</a></li>
            {scenarios.map((s) => (
              <li key={s}>
                <a href={`/maps/${PDF_SCENARIO[s]}-${PDF_BAND[band]}.pdf`} target="_blank" rel="noreferrer">
                  {tr('sourceMap', { scenario: scenarioNames[s], band: BAND_NAMES[band] })}
                </a>
              </li>
            ))}
            <li>
              <a href="https://ppsdata.info" target="_blank" rel="noreferrer">ppsdata.info</a> {tr('sourcePpsdataBy')}
              {' '}(<a href="https://github.com/meub/pps-data" target="_blank" rel="noreferrer">pps-data</a>). {tr('sourcePpsdataRest')}
            </li>
          </ul>
          <p>{tr('method')}</p>
          <p>{tr('privacy')}</p>
          <p>{tr('notAffiliated')}</p>
        </footer>
        </div>
      </aside>
    </main>
  )
}
