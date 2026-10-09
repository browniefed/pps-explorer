import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHANGES } from '../src/lib/changes-data.mjs'
import { closes, describe, eventsFor, schoolKey, spotNotes } from '../src/lib/changes.mjs'
import { assignmentsAt } from '../src/lib/assignments.mjs'

const read = (f) => JSON.parse(readFileSync(`public/data/${f}.geojson`))
const scenarios = ['sq', 'a', 'b'], bands = ['k5', '68', '912']
const schoolLayers = Object.fromEntries(scenarios.flatMap((s) => bands.map((b) => [`${s}_${b}`, read(`${s}_${b}_schools`)])))
const areaLayers = Object.fromEntries(scenarios.flatMap((s) => bands.map((b) => [`${s}_${b}`, read(`${s}_${b}`)])))
const areaNames = Object.fromEntries(Object.entries(areaLayers).map(([k, fc]) => [k, new Set(fc.features.map((f) => schoolKey(f.properties.name)))]))
const mapSchools = new Set(Object.values(schoolLayers).flatMap((fc) => fc.features.map((f) => schoolKey(f.properties.name))))

test('school keys normalise names across the memo and the maps', () => {
  assert.equal(schoolKey('Rigler K-5 Spanish Immersion'), 'rigler')
  assert.equal(schoolKey('MLK Jr K-5 Neighborhood'), schoolKey('Dr. Martin Luther King Jr.'))
  assert.equal(schoolKey('César Chávez K-8 Spanish Immersion'), schoolKey('César Chávez'))
  assert.equal(schoolKey('Gray Middle School Neighborhood'), schoolKey('Robert Gray'))
  assert.equal(schoolKey('Metro. Learning Center K-12 Focus/Option'), schoolKey('Metropolitan Learning Center'))
})

test('every school named in the changes data appears on the PPS maps', () => {
  const named = new Set()
  for (const events of Object.values(CHANGES))
    for (const e of events) for (const n of [e.school, e.to, ...(e.from ?? []), ...(e.schools ?? [])].flat().filter(Boolean)) named.add(n)
  // Roosevelt and Lincoln are high schools: they only appear on the 9-12 maps as clusters.
  const highSchools = new Set(read('sq_912').features.map((f) => schoolKey(f.properties.name)))
  const missing = [...named].filter((n) => !mapSchools.has(schoolKey(n)) && !highSchools.has(schoolKey(n)))
  assert.deepEqual(missing, [])
})

test('closures in the board memo match the "School Closed" labels on each scenario map', () => {
  for (const s of ['a', 'b']) {
    const onMap = new Set(bands.flatMap((b) => schoolLayers[`${s}_${b}`].features
      .filter((f) => f.properties.name.includes('School Closed')).map((f) => schoolKey(f.properties.name))))
    const inMemo = new Set(CHANGES[s].filter((e) => e.kind === 'close').map((e) => schoolKey(e.school)))
    assert.deepEqual([...onMap].sort(), [...inMemo].sort(), `scenario ${s}`)
  }
  assert.equal(CHANGES.a.filter((e) => e.kind === 'close').length, 14)
  assert.equal(CHANGES.b.filter((e) => e.kind === 'close').length, 11)
})

test('Rigler stays open: its notes explain the Scott program move and the missing area', () => {
  assert(!closes('a', 'Rigler') && !closes('b', 'Rigler'))
  const rigler = schoolLayers.sq_k5.features.find((f) => f.properties.name.startsWith('Rigler')).geometry.coordinates
  const results = assignmentsAt(areaLayers, rigler)
  assert.equal(results.sq.k5.school, 'Rigler Elementary')
  assert.equal(results.a.k5.school, 'Scott Elementary')
  const notes = spotNotes('a', results, areaNames).map((n) => n.text)
  assert(notes.some((t) => t === 'Spanish immersion moves here from Scott.'), notes.join('\n'))
  assert(notes.some((t) => t.startsWith('Rigler is not closing. On PPS’s Scenario A map, Rigler and Scott are inside one boundary.')), notes.join('\n'))
  assert.equal(results.a.k5.status, 'unclear')
  assert.deepEqual(results.a.k5.alternatives, ['Rigler Elementary'])
  // a spot in Scott's own current area is not unclear
  const scott = schoolLayers.sq_k5.features.find((f) => f.properties.name.startsWith('Scott')).geometry.coordinates
  assert.equal(assignmentsAt(areaLayers, scott).a.k5.status, 'matched')
})

test('scenario differences: Lewis closes only in A, and B explains that it stays open', () => {
  assert(closes('a', 'Lewis') && !closes('b', 'Lewis'))
  assert.match(eventsFor('b', 'Lewis').map((e) => describe(e)).join(' '), /Lewis stays open/)
  assert.equal(describe(eventsFor('a', 'Vernon')[0], schoolKey('Vernon')), 'Vernon becomes K–5. Its grades 6–8 move to Harriet Tubman.')
})

test('notes and change descriptions read naturally in Spanish', () => {
  const rigler = schoolLayers.sq_k5.features.find((f) => f.properties.name.startsWith('Rigler')).geometry.coordinates
  const notes = spotNotes('a', assignmentsAt(areaLayers, rigler), areaNames, {}, 'es').map((n) => n.text)
  assert(notes.includes('El programa de inmersión en español se muda aquí desde Scott.'), notes.join('\n'))
  assert(notes.some((t) => t.startsWith('Rigler no cierra. En el mapa del Escenario A de PPS, Rigler y Scott están dentro de un mismo límite.')), notes.join('\n'))
  assert.equal(describe(eventsFor('a', 'Vernon')[0], schoolKey('Vernon'), 'es'), 'Vernon pasa a ser K–5. Su 6.º a 8.º grado se muda a Harriet Tubman.')
  const maplewood = CHANGES.a.find((e) => e.school === 'Maplewood')
  assert.equal(describe(maplewood, undefined, 'es'), 'Maplewood cierra. Sus estudiantes van a Hayhurst y Rieke. Cerca del 70% de su zona pasa a Hayhurst y el 30% a Rieke.')
  // every memo-derived sentence has a Spanish version
  for (const e of [...CHANGES.a, ...CHANGES.b]) {
    if (e.detail) assert(e.detail_es, `missing detail_es: ${e.detail}`)
    if (e.text) assert(e.text_es, `missing text_es: ${e.text}`)
  }
})
