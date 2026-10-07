import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { closureMoves, immersionSites, languagesOf, programKind, programMoves } from '../src/lib/programs.mjs'
import { schoolKey } from '../src/lib/changes.mjs'
import { lookup } from '../src/lib/geometry.mjs'

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

test('Rigler, Kelly and César Chávez have no area named for them in A and B (they share an outline or, for Chávez, go to Rosa Parks)', () => {
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

test('closure arrows point from each closing school to its receiving schools', () => {
  const c = (s, b) => closureMoves(s, { scenarioSchools: read(`${s}_${b}_schools`), sqSchools: read(`sq_${b}_schools`) })
    .map((m) => `${m.fromName} -> ${m.toName}`).sort()
  const a = c('a', 'k5')
  for (const m of ['Maplewood -> Hayhurst', 'Maplewood -> Rieke', 'Buckman -> Abernethy', 'Rose City Park -> Scott', 'Lewis -> Duniway', 'Stephenson -> Markham'])
    assert(a.includes(m), m)
  assert(!c('b', 'k5').some((m) => m.startsWith('Lewis') || m.startsWith('Rose City Park') || m.startsWith('Stephenson')))
  assert.deepEqual(c('a', '68'), ['Sellwood -> Brentwood', 'Sellwood -> Hosford'])
})

test('change areas: real moves kept, tracing slivers and river water dropped', () => {
  const pairs = (k) => read(`${k}_changed`).features.map((f) => `${f.properties.from} -> ${f.properties.to}`)
  assert(pairs('a_k5').includes('Rose City Park Elementary -> Scott Elementary'), 'memo: Rose City Park neighborhood -> Scott in A')
  assert(!pairs('b_k5').some((p) => p.startsWith('Rose City Park')), 'Rose City Park stays open in B')
  assert(pairs('a_k5').includes('Maplewood Elementary -> Hayhurst Elementary'))
  assert(!pairs('b_k5').some((p) => p.startsWith('Stephenson')), 'Stephenson keeps its area in B')
  for (const k of ['a_k5', 'b_k5']) assert(!pairs(k).some((p) => p.includes('Skyline') || p.includes('Bridlemile')), `${k}: inset seam slivers`)
  // the Willamette at the Hawthorne Bridge is water in every layer
  const river = [-122.6705, 45.5134]
  for (const k of ['a_k5', 'b_k5', 'a_68', 'b_68', 'a_912', 'b_912'])
    assert.equal(lookup(read(`${k}_changed`), river).length, 0, k)
})

test('outlines holding two status-quo schools are flagged unclear, not guessed', () => {
  for (const s of ['a', 'b']) {
    const unclear = read(`${s}_k5`).features.filter((f) => f.properties.unclear_between).map((f) => f.properties.unclear_between.join('+')).sort()
    assert.deepEqual(unclear, ['Kelly+Lent', 'Rigler+Scott'], s)
    const pairs = read(`${s}_k5_changed`).features.map((f) => `${f.properties.from} -> ${f.properties.to}`)
    assert(!pairs.some((p) => p.startsWith('Rigler') || p.startsWith('Kelly')), `${s}: unclear areas are not hatched`)
  }
})
