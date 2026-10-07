import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { immersionSites, languagesOf, programKind, programMoves } from '../src/lib/programs.mjs'
import { schoolKey } from '../src/lib/changes.mjs'

const read = (k) => JSON.parse(readFileSync(`public/data/${k}.geojson`))
const areaKeys = (k) => new Set(read(k).features.map((f) => schoolKey(f.properties.name)))
const moves = (s, b) => programMoves(s, { scenarioSchools: read(`${s}_${b}_schools`), sqSchools: read(`sq_${b}_schools`) })
  .map((m) => `${m.kind}: ${m.fromName} -> ${m.toName}`).sort()

test('languages and program kinds are read from map labels and memo wording', () => {
  assert.deepEqual(languagesOf('Roseway Heights Middle School Spanish Immersion, Vietnamese Immersion'), ['Spanish', 'Vietnamese'])
  assert.deepEqual(languagesOf('Hosford Middle School Neighborhood'), [])
  assert.equal(programKind('Chinese (Mandarin) immersion'), 'Mandarin')
  assert.equal(programKind('Spanish immersion (middle grades)'), 'Spanish')
  assert.equal(programKind('Deaf and Hard of Hearing program'), 'Deaf and Hard of Hearing')
})

test('Rigler, Kelly and César Chávez become immersion schools without a neighborhood area in A and B', () => {
  const noArea = (s) => immersionSites(read(`${s}_k5_schools`), areaKeys(`${s}_k5`))
    .filter((x) => !x.ownArea).map((x) => `${x.short} (${x.languages.join(', ')})`).sort()
  // Richmond is a whole-school Japanese immersion school already, so it has no neighborhood area today
  assert.deepEqual(noArea('sq'), ['Richmond (Japanese)'])
  for (const s of ['a', 'b'])
    assert.deepEqual(noArea(s), ['César Chávez (Spanish)', 'Kelly (Russian)', 'Richmond (Japanese)', 'Rigler (Spanish)'], s)
})

test('program-move arrows follow the board memo, per scenario and grade band', () => {
  const a = moves('a', 'k5')
  for (const m of ['Spanish: Scott -> Rigler', 'Spanish: Atkinson -> Lent', 'Vietnamese: Rose City Park -> Vestal',
    'Mandarin: Clark -> Woodstock', 'Mandarin: MLK Jr. -> Boise-Eliot/Humboldt', 'Deaf and Hard of Hearing: Creston -> Glencoe',
    'Spanish: Beach -> César Chávez', 'Spanish: James John -> César Chávez', 'Spanish: Sitton -> César Chávez']) assert(a.includes(m), m)
  assert(!moves('b', 'k5').some((m) => m.startsWith('Vietnamese')), 'Vietnamese stays at Rose City Park in B')
  assert.deepEqual(moves('a', '68').filter((m) => m.startsWith('Spanish')), ['Spanish: Beaumont -> Roseway Heights', 'Spanish: Ockley Green -> George'])
})
