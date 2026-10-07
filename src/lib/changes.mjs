import { CHANGES } from './changes-data.mjs'
import { bands } from './assignments.mjs'

// School names differ across sources ("MLK Jr" on maps, "Dr. Martin Luther King Jr." in the memo,
// "Gray" vs "Robert Gray", "Sunnyside" vs "Sunnyside Environmental"); compare on a normalised key.
const ALIASES = {
  drmartinlutherkingjr: 'mlkjr', martinlutherkingjr: 'mlkjr', robertgray: 'gray', mttabor: 'mttabor',
  sunnyside: 'sunnysideenvironmental', bridger: 'bridgercreativescience', chavez: 'cesarchavez',
  metrolearningcenter: 'metropolitanlearningcenter', mlc: 'metropolitanlearningcenter', mlcodyssey: 'metropolitanlearningcenter',
}

// "Hosford Middle School", "Astor K-8", "Rigler K-5 Spanish Immersion", "Metro. Learning Center K-12" -> key
export function schoolKey(name) {
  const base = name
    .replace(/\s(K-5|K-8|K-12|2-8|Middle|High|School|Building|Elementary)\b.*$/, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/metro\.?\s/, 'metropolitan ').replace(/[^a-z]/g, '')
  return ALIASES[base] ?? base
}

const involves = (e, key) =>
  (e.school && schoolKey(e.school) === key) ||
  (e.to && (Array.isArray(e.to) ? e.to : [e.to]).some((s) => schoolKey(s) === key)) ||
  (e.from && e.from.some((s) => schoolKey(s) === key)) ||
  (e.schools && e.schools.some((s) => schoolKey(s) === key))

const list = (names) => names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`

// One plain sentence describing an event, from the point of view of `key` when given.
export function describe(e, key) {
  const is = (s) => key && schoolKey(s) === key
  switch (e.kind) {
    case 'close':
      if (key && !is(e.school)) return `Receives students from ${e.school}, which closes.${e.detail ? ' ' + e.detail : ''}`
      return `${e.school} closes${e.to ? `; students go to ${list(e.to)}` : ''}.${e.detail ? ' ' + e.detail : ''}`
    case 'program':
      if (key && is(e.to)) return `${e.program} moves here from ${list(e.from)}.${e.detail ? ' ' + e.detail : ''}`
      if (key && e.from.some(is)) {
        const others = e.from.filter((s) => !is(s))
        return `Its ${e.program} moves to ${e.to}${others.length ? `, along with ${list(others)}’s` : ''}.${e.detail ? ' ' + e.detail : ''}`
      }
      return `${e.program} moves from ${list(e.from)} to ${e.to}.${e.detail ? ' ' + e.detail : ''}`
    case 'grades':
      if (key && is(e.to)) return `Receives grades 6–8 from ${e.school}, which becomes K–5.`
      return `${e.school} becomes K–5; its grades 6–8 move to ${e.to}.`
    default:
      return e.text
  }
}

export function eventsFor(scenario, name) {
  const key = schoolKey(name)
  return (CHANGES[scenario] ?? []).filter((e) => involves(e, key))
}

export function closes(scenario, name) {
  const key = schoolKey(name)
  return (CHANGES[scenario] ?? []).some((e) => e.kind === 'close' && schoolKey(e.school) === key)
}

// Notes for a selected spot: what happens to the schools that serve it today and under the scenario.
// `results` is assignmentsAt() output; `areaNames` maps "<scenario>_<band>" to the set of school keys
// that have an attendance area on that map (to spot schools that stay open without one, like Rigler).
// `labels` optionally maps "<scenario>_<band>" to { schoolKey: map label }, to name the program such a
// school keeps ("Rigler K-5 Spanish Immersion").
export function spotNotes(scenario, results, areaNames, labels = {}) {
  if (scenario === 'sq' || !results) return []
  const notes = [], seen = new Set()
  const add = (school, text) => {
    const id = school + '|' + text
    if (!seen.has(id)) { seen.add(id); notes.push({ school, text }) }
  }
  for (const b of bands) {
    const before = results.sq[b].school, after = results[scenario][b].school
    const short = (name) => name.replace(/ (Elementary|Middle School|High School|K-8)$/, '')
    // Open school whose area disappears from this map without a closure or grade change explaining it
    // (e.g. Rigler, which becomes an immersion site inside Scott's area). Most important, so it goes first.
    if (before && after && before !== after) {
      const key = schoolKey(before)
      const S = scenario.toUpperCase()
      if (results[scenario][b].status === 'unclear') {
        // one outline on the scenario map holds both schools, and PPS doesn't say which serves this area
        add(short(before), `${short(before)} is not closing. On PPS’s Scenario ${S} map, ${short(before)} and ${short(after)} sit inside one boundary with no line between them, and PPS’s documents don’t say which school would serve ${short(before)}’s current area. Check with PPS (Rightsizing@pps.net).`)
      } else {
        const explained = eventsFor(scenario, before).some((e) => e.kind === 'close' || (e.kind === 'grades' && schoolKey(e.school) === key))
        if (!explained && !areaNames[`${scenario}_${b}`]?.has(key)) {
          const label = labels[`${scenario}_${b}`]?.[key] ?? ''
          const langs = [...label.matchAll(/(Spanish|Mandarin|Vietnamese|Japanese|Russian) Immersion/g)].map((m) => m[1])
          const as = langs.length ? ` as a ${langs.join(' and ')} immersion school` : ''
          add(short(before), `${short(before)} is not closing. It stays open${as}, but on the Scenario ${S} map it has no neighborhood boundary of its own, so this spot is assigned to ${short(after)}.`)
        }
      }
    }
    // today's school first, then the school this spot is assigned to under the scenario
    for (const name of [before, after]) {
      if (!name) continue
      for (const e of eventsFor(scenario, name)) add(short(name), describe(e, schoolKey(name)))
    }
  }
  return notes
}

// Grouped list for the "What changes" panel.
export function digest(scenario) {
  const events = CHANGES[scenario] ?? []
  return {
    closures: events.filter((e) => e.kind === 'close'),
    programs: events.filter((e) => e.kind === 'program'),
    grades: events.filter((e) => e.kind === 'grades'),
    notes: events.filter((e) => e.kind === 'note'),
  }
}
