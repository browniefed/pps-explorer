import { lookup, nearest } from './geometry.mjs'

export const scenarios = ['sq', 'a', 'b']
export const bands = ['k5', '68', '912']
export const NEAR_METRES = 150

// Name shown in tables: "Abernethy Elementary" -> "Abernethy", "Hosford Middle School" -> "Hosford".
export function shortName(name) {
  return name.replace(/ (Elementary|Middle School|High School)$/, '')
}

function assignment(collection, point) {
  if (!collection) return { status: 'unavailable', school: null }
  const hits = lookup(collection, point)
  if (hits.length > 1) return { status: 'ambiguous', school: null, candidates: hits.map((f) => f.properties.name).sort() }
  if (hits.length === 1) return { status: 'matched', school: hits[0].properties.name }
  // On a hairline sliver between neighbours, or just off a river bank: report the nearest area, flagged.
  const near = nearest(collection, point, NEAR_METRES)
  if (near) return { status: 'near-boundary', school: near.properties.name }
  return { status: 'outside', school: null }
}

// Every scenario x grade band at one [lng, lat] point, with changes from status quo flagged.
export function assignmentsAt(datasets, point) {
  const result = {}
  for (const s of scenarios) {
    result[s] = {}
    for (const b of bands) {
      const a = assignment(datasets[`${s}_${b}`], point)
      if (s !== 'sq') a.changed = a.school !== result.sq[b].school
      result[s][b] = a
    }
  }
  return result
}
