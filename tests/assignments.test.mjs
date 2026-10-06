import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { assignmentsAt, shortName } from '../src/lib/assignments.mjs'

const ring = (x0) => [[x0, 0], [x0 + 10, 0], [x0 + 10, 10], [x0, 10], [x0, 0]]
const feature = (name, x0 = 0) => ({ type: 'Feature', properties: { name }, geometry: { type: 'Polygon', coordinates: [ring(x0)] } })
const fc = (...features) => ({ type: 'FeatureCollection', features })

test('a point is evaluated in every scenario and grade band, with changes from status quo flagged', () => {
  const datasets = {}
  for (const s of ['sq', 'a', 'b']) for (const b of ['k5', '68', '912']) datasets[`${s}_${b}`] = fc(feature(s === 'b' && b === '68' ? 'Other' : `School ${b}`))
  const r = assignmentsAt(datasets, [5, 5])
  assert.equal(r.sq.k5.school, 'School k5')
  assert.equal(r.a.k5.changed, false)
  assert.equal(r.b['68'].school, 'Other')
  assert.equal(r.b['68'].changed, true)
})

test('overlaps, missing layers and far-away points never invent a school', () => {
  const r = assignmentsAt({ sq_912: fc(feature('Grant'), feature('McDaniel')), sq_68: fc(feature('Hosford')) }, [5, 5])
  assert.equal(r.sq['912'].status, 'ambiguous')
  assert.deepEqual(r.sq['912'].candidates, ['Grant', 'McDaniel'])
  assert.equal(r.sq.k5.status, 'unavailable')
  // degrees here are huge distances, so the 150 m nearest-area fallback must not trigger
  assert.equal(assignmentsAt({ sq_68: fc(feature('Hosford')) }, [20, 20]).sq['68'].status, 'outside')
})

test('shortName drops the level suffix but keeps K-8', () => {
  assert.equal(shortName('Abernethy Elementary'), 'Abernethy')
  assert.equal(shortName('Hosford Middle School'), 'Hosford')
  assert.equal(shortName('Skyline K-8'), 'Skyline K-8')
})

test('known addresses resolve against the real data', () => {
  const datasets = {}
  for (const s of ['sq', 'a', 'b']) for (const b of ['k5', '68', '912']) datasets[`${s}_${b}`] = JSON.parse(readFileSync(`public/data/${s}_${b}.geojson`))
  // 3830 SE Division St (Esri geocode)
  const r = assignmentsAt(datasets, [-122.6236, 45.50458])
  assert.equal(r.sq.k5.school, 'Abernethy Elementary')
  assert.equal(r.sq['68'].school, 'Hosford Middle School')
  assert.equal(r.sq['912'].school, 'Cleveland High School')
})
