import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const dli = JSON.parse(readFileSync('public/data/dli_reach.json'))
const names = (p) => dli.periods[p].sites.map((s) => s.name)

test('Spanish DLI elementary sites per period match PPS sources', () => {
  // PPS "Enrollment Details for Language Immersion Schools, October 2025"
  assert.deepEqual(names('sq'), ['Ainsworth', 'Atkinson', 'Beach', 'César Chávez', 'James John', 'Lent', 'Rigler', 'Scott', 'Sitton'])
  // 2022-23: Bridger still had Spanish immersion (moved to Lent in fall 2023)
  assert.deepEqual(names('2022'), [...names('sq'), 'Bridger Creative Science'].sort())
  // both scenario maps: the four consolidated sites
  for (const s of ['a', 'b']) assert.deepEqual(names(s), ['Ainsworth', 'César Chávez', 'Lent', 'Rigler'])
})

test('1-mile reach shrinks from 2022 to the scenarios', () => {
  const share = (p) => dli.periods[p].reach_share
  assert(share('2022') > share('sq') && share('sq') > share('a'))
  assert.equal(share('a'), share('b'))
  for (const p of Object.values(dli.periods)) for (const s of p.sites) assert.equal(s.coords.length, 2)
})
