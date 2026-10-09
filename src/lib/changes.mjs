import { CHANGES } from './changes-data.mjs'
import { bands } from './assignments.mjs'
import { list as join, languageName, memoText, programName, t } from './i18n.mjs'

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

export { programName }

// One plain sentence describing an event, from the point of view of `key` when given.
export function describe(e, key, lang = 'en') {
  const is = (s) => key && schoolKey(s) === key
  const detail = memoText(e, 'detail', lang)
  switch (e.kind) {
    case 'close':
      if (key && !is(e.school)) return t(lang, 'closeReceives', { school: e.school, detail })
      return t(lang, 'closeSelf', { school: e.school, to: e.to && join(lang, e.to), detail })
    case 'program': {
      const program = programName(e.program, lang)
      if (key && is(e.to)) return t(lang, 'programHere', { program, from: join(lang, e.from), detail })
      if (key && e.from.some(is)) {
        const others = e.from.filter((s) => !is(s))
        return t(lang, 'programIts', { program, to: e.to, others: others.length ? join(lang, others) : '', detail })
      }
      return t(lang, 'programMove', { program, from: join(lang, e.from), to: e.to, detail })
    }
    case 'grades':
      if (key && is(e.to)) return t(lang, 'gradesReceives', { school: e.school })
      return t(lang, 'gradesSelf', { school: e.school, to: e.to })
    default:
      return memoText(e, 'text', lang)
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
export function spotNotes(scenario, results, areaNames, labels = {}, lang = 'en') {
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
      const scenarioName = t(lang, `scenario.${scenario}`)
      if (results[scenario][b].status === 'unclear') {
        // one outline on the scenario map holds both schools, and PPS doesn't say which serves this area
        add(short(before), t(lang, 'noteUnclear', { before: short(before), after: short(after), scenario: scenarioName }))
      } else {
        const explained = eventsFor(scenario, before).some((e) => e.kind === 'close' || (e.kind === 'grades' && schoolKey(e.school) === key))
        if (!explained && !areaNames[`${scenario}_${b}`]?.has(key)) {
          const label = labels[`${scenario}_${b}`]?.[key] ?? ''
          const langs = [...label.matchAll(/(Spanish|Mandarin|Vietnamese|Japanese|Russian) Immersion/g)].map((m) => m[1])
          const names = langs.map((l) => languageName(l, lang))
          const as = names.length ? t(lang, 'noteNoAreaAs', { langs: join(lang, names) }) : ''
          add(short(before), t(lang, 'noteNoArea', { before: short(before), after: short(after), scenario: scenarioName, as }))
        }
      }
    }
    // today's school first, then the school this spot is assigned to under the scenario
    for (const name of [before, after]) {
      if (!name) continue
      for (const e of eventsFor(scenario, name)) add(short(name), describe(e, schoolKey(name), lang))
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
