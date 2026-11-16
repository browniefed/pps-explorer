import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { assignmentsAt, shortName } from '../src/lib/assignments.mjs'
import { CHANGES, SUMMARY } from '../src/lib/changes-data.mjs'
import { schoolKey } from '../src/lib/changes.mjs'

// Superintendent's Recommendation (Nov 13, 2026), checked against the board memo's region tables.
const load = (name) => JSON.parse(readFileSync(`public/data/${name}.geojson`))
const datasets = {}
for (const s of ['sq', 'r', 'a', 'b']) for (const b of ['k5', '68', '912']) datasets[`${s}_${b}`] = load(`${s}_${b}`)
// a school building's spot is inside its own status quo attendance area
const at = (school, band = 'k5') => {
  const f = load(`sq_${band}_schools`).features.find((x) => schoolKey(x.properties.name) === schoolKey(school))
  const [lon, lat] = f.geometry.coordinates  // GeoJSON order, as assignmentsAt takes it
  return assignmentsAt(datasets, [lon, lat]).r
}
const school = (a) => shortName(a.school ?? '')

test('closing schools’ areas go where the memo says', () => {
  const moves = { Beach: 'Chief Joseph', Peninsula: 'Rosa Parks', Sabin: 'MLK Jr', Creston: 'Atkinson', Irvington: 'Beverly Cleary',
    'Rose City Park': 'Scott', Lewis: 'Duniway', Marysville: 'Arleta', Woodmere: 'Whitman' }
  for (const [from, to] of Object.entries(moves)) assert.equal(school(at(from).k5), to, `${from} K-5`)
  // Buckman splits at E. Burnside St.: the building (SE Stark) is south of it, so Abernethy
  assert.equal(school(at('Buckman').k5), 'Abernethy')
})

test('Spanish immersion hubs hand their neighborhood areas to nearby schools', () => {
  assert.equal(school(at('Rigler').k5), 'Scott')
  assert.equal(school(at('Lent').k5), 'Kelly')
  assert.equal(school(at('César Chávez').k5), 'Rosa Parks')
  const k5 = new Set(datasets.r_k5.features.map((f) => schoolKey(f.properties.name)))
  for (const hub of ['Rigler', 'Lent', 'César Chávez']) assert(!k5.has(schoolKey(hub)), `${hub} has no neighborhood area`)
})

test('K-8s that become K-5 send grades 6-8 to the memo’s middle schools', () => {
  const to = { Vernon: 'Harriet Tubman', Faubion: 'Ockley Green', 'Beverly Cleary': 'Beaumont', Laurelhurst: 'Mt Tabor',
    'Sunnyside Environmental': 'Hosford', 'Bridger Creative Science': 'Harrison Park', 'César Chávez': 'George' }
  for (const [k8, ms] of Object.entries(to)) assert.equal(school(at(k8)['68']), ms, `${k8} 6-8`)
  // memo: from fall 2028 the former Peninsula area goes to George, not Ockley Green
  assert.equal(school(at('Peninsula')['68']), 'George')
})

test('high school feeders follow the memo', () => {
  assert.equal(school(at('Whitman')['912']), 'Franklin')
  assert.equal(school(at('Sunnyside Environmental')['912']), 'Cleveland')
  assert.equal(school(at('Skyline')['912']), 'Lincoln')
})

test('ten schools close, five each fall, and every school named in a change is on the maps', () => {
  const closes = CHANGES.r.filter((e) => e.kind === 'close')
  assert.equal(closes.length, SUMMARY.r.closures)
  assert.equal(closes.filter((e) => e.year === 2027).length, SUMMARY.r.closures2027)
  assert.equal(closes.filter((e) => e.year === 2028).length, SUMMARY.r.closures2028)
  for (const e of closes) {
    const label = load('r_k5_schools').features.find((f) => schoolKey(f.properties.name) === schoolKey(e.school))?.properties.name
    assert.match(label ?? '', /School Closed/, `${e.school} is marked closed`)
  }
  const known = new Set(['sq', 'r'].flatMap((s) => ['k5', '68', '912'].flatMap((b) => load(`${s}_${b}_schools`).features.map((f) => schoolKey(f.properties.name)))))
  for (const e of CHANGES.r) {
    const names = [e.school, ...(e.to ? [e.to].flat() : []), ...(e.from ?? []), ...(e.schools ?? [])].filter(Boolean)
    for (const n of names) assert(known.has(schoolKey(n)), `${n} (${e.kind}) is a school on the maps`)
  }
})
