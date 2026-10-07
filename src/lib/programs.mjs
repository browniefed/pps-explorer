import { CHANGES } from './changes-data.mjs'
import { schoolKey } from './changes.mjs'

// Colours for the immersion overlay: one per language, plus the two non-language program moves.
export const PROGRAM_COLORS = {
  Spanish: '#d9480f',
  Mandarin: '#c2255c',
  Vietnamese: '#6741d9',
  Japanese: '#1971c2',
  Russian: '#2b8a3e',
  'Deaf and Hard of Hearing': '#495057',
  Odyssey: '#5c677d',
}

// "Roseway Heights Middle School Spanish Immersion, Vietnamese Immersion" -> ['Spanish', 'Vietnamese']
export function languagesOf(label) {
  return [...label.matchAll(/(Spanish|Mandarin|Chinese|Vietnamese|Japanese|Russian) Immersion/g)]
    .map((m) => (m[1] === 'Chinese' ? 'Mandarin' : m[1]))
}

// Program name from the board memo -> colour key
export function programKind(program) {
  if (/Deaf and Hard of Hearing/.test(program)) return 'Deaf and Hard of Hearing'
  if (/Odyssey/.test(program)) return 'Odyssey'
  const m = program.match(/Spanish|Mandarin|Chinese|Vietnamese|Japanese|Russian/)
  return m ? (m[0] === 'Chinese' ? 'Mandarin' : m[0]) : null
}

const point = (fc, key) => {
  const f = fc?.features.find((x) => schoolKey(String(x.properties?.name ?? '')) === key)
  return f && f.geometry.type === 'Point' ? f.geometry.coordinates : null
}

// Immersion schools on one map, from the school labels. `ownArea` is false for schools that stay open
// as immersion sites without a neighbourhood boundary (Rigler, Kelly and César Chávez in A and B).
export function immersionSites(schools, areaKeys) {
  const out = []
  for (const f of schools.features) {
    const name = String(f.properties?.name ?? '')
    const languages = languagesOf(name)
    if (!languages.length || f.geometry.type !== 'Point') continue
    const key = schoolKey(name)
    out.push({ key, name, short: name.replace(/\s(K-5|K-8|K-12|Middle School|High School)\b.*$/, ''), languages, coords: f.geometry.coordinates, ownArea: areaKeys.has(key) })
  }
  return out
}

// Program moves to draw for a scenario and grade band: one arrow per sending school. A move belongs to
// the band whose school maps show both ends (Scott -> Rigler on K-5, Beaumont -> Roseway Heights on 6-8).
// `layers` maps "<scenario>_<band>_schools" style keys: { scenario: fc, sq: fc } for the band.
export function programMoves(scenario, { scenarioSchools, sqSchools }) {
  const moves = []
  for (const e of CHANGES[scenario] ?? []) {
    if (e.kind !== 'program') continue
    const kind = programKind(e.program)
    const to = point(scenarioSchools, schoolKey(e.to)) ?? point(sqSchools, schoolKey(e.to))
    if (!to) continue
    for (const from of e.from) {
      const at = point(sqSchools, schoolKey(from)) ?? point(scenarioSchools, schoolKey(from))
      if (at) moves.push({ program: e.program, kind, color: PROGRAM_COLORS[kind] ?? '#495057', fromName: from, toName: e.to, from: at, to })
    }
  }
  return moves
}
