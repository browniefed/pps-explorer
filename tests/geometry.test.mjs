import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contains, edgeDistance, lookup, nearest } from '../src/lib/geometry.mjs'

const outer = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]], hole = [[3, 3], [7, 3], [7, 7], [3, 7], [3, 3]]

test('polygon lookup excludes holes and outside points', () => {
  const g = { type: 'Polygon', coordinates: [outer, hole] }
  assert(contains(g, [1, 1]))
  assert(!contains(g, [5, 5]))
  assert(!contains(g, [11, 5]))
})

test('overlapping polygons return all matches', () => {
  const f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [outer] }, properties: {} }
  assert.equal(lookup({ features: [f, f] }, [1, 1]).length, 2)
})

test('edge distance and nearest use metres and respect the cutoff', () => {
  // ~0.001 degree of latitude is ~110 m
  const sq = { type: 'Polygon', coordinates: [[[-122.6, 45.5], [-122.59, 45.5], [-122.59, 45.51], [-122.6, 45.51], [-122.6, 45.5]]] }
  const d = edgeDistance(sq, [-122.595, 45.499])
  assert(d > 100 && d < 120, `got ${d}`)
  const fc = { features: [{ type: 'Feature', geometry: sq, properties: { name: 'X' } }] }
  assert.equal(nearest(fc, [-122.595, 45.499], 150)?.properties.name, 'X')
  assert.equal(nearest(fc, [-122.595, 45.495], 150), null)
})

const scenarios = ['sq', 'a', 'b'], bands = ['k5', '68', '912']

test('all nine layers have named areas with closed, finite, Portland-area rings', () => {
  for (const s of scenarios) for (const b of bands) {
    const data = JSON.parse(readFileSync(`public/data/${s}_${b}.geojson`))
    assert(data.features.length > 0)
    for (const f of data.features) {
      assert(f.properties.name, `${s}_${b} feature without a name`)
      assert(f.properties.cluster, `${s}_${b} ${f.properties.name} without a cluster`)
      for (const poly of f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
        for (const ring of poly) {
          assert(ring.length >= 4)
          assert.deepEqual(ring[0], ring.at(-1))
          for (const [lon, lat] of ring) assert(lon > -123 && lon < -122.4 && lat > 45.35 && lat < 45.8)
        }
    }
  }
})

test('high school layers have one area per cluster and school markers load', () => {
  for (const s of scenarios) {
    const hs = JSON.parse(readFileSync(`public/data/${s}_912.geojson`))
    assert.equal(new Set(hs.features.map((f) => f.properties.cluster)).size, 8)
    for (const b of bands) assert(JSON.parse(readFileSync(`public/data/${s}_${b}_schools.geojson`)).features.length > 0)
  }
})

test('status quo keeps its K-8 areas, including the Skyline inset', () => {
  const k5 = JSON.parse(readFileSync('public/data/sq_k5.geojson')).features
  const k8 = k5.filter((f) => f.properties.level === 'K-8').map((f) => f.properties.name)
  for (const name of ['Skyline K-8', 'Astor K-8', 'Vernon K-8', 'Faubion K-8']) assert(k8.includes(name), `missing ${name}`)
})

test('basemap features never leak into areas: the only hole is the Maywood Park enclave', () => {
  for (const s of scenarios) for (const b of bands) {
    const holes = []
    for (const f of JSON.parse(readFileSync(`public/data/${s}_${b}.geojson`)).features)
      for (const poly of f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
        for (const ring of poly.slice(1)) holes.push([f.properties.name, ring])
    assert(holes.length <= 1, `${s}_${b} has ${holes.length} holes: ${holes.map((h) => h[0]).join(', ')}`)
    // Maywood Park (its own city, not in PPS) sits around 45.54 N, 122.56 W
    for (const [, ring] of holes) assert(ring.some(([lon, lat]) => Math.abs(lat - 45.5416) < 0.005 && Math.abs(lon + 122.5638) < 0.005))
  }
})

test('areas stop at the state line in the Columbia instead of reaching the Washington shore', () => {
  // river north of the city's district edge (45.618 N at 122.6755 W, 45.613 N at 122.66 W)
  const waterNearVancouver = [[-122.6755, 45.6205], [-122.66, 45.6195]]
  for (const s of scenarios) for (const b of bands) {
    const fc = JSON.parse(readFileSync(`public/data/${s}_${b}.geojson`))
    for (const p of waterNearVancouver) assert.equal(lookup(fc, p).length, 0, `${s}_${b} covers ${p}`)
  }
})

test('areas that feed two high schools keep both (matches the city boundary data)', () => {
  const split = (k, name) => JSON.parse(readFileSync(`public/data/${k}.geojson`)).features
    .find((f) => f.properties.name === name).properties.clusters.map((c) => c.name).sort()
  assert.deepEqual(split('sq_k5', 'Bridlemile Elementary'), ['Lincoln', 'Wells-Barnett'])
  assert.deepEqual(split('sq_k5', 'Whitman Elementary'), ['Cleveland', 'Franklin'])
  assert.deepEqual(split('sq_68', 'Brentwood Middle School'), ['Cleveland', 'Franklin'])
})
