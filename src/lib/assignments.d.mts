import type { FeatureCollection } from 'geojson'
export type Scenario = 'sq' | 'a' | 'b'
export type Band = 'k5' | '68' | '912'
export const scenarios: readonly Scenario[]
export const bands: readonly Band[]
export const NEAR_METRES: number
export type Assignment = {
  status: 'matched' | 'near-boundary' | 'ambiguous' | 'outside' | 'unavailable' | 'unclear'
  school: string | null
  candidates?: string[]
  changed?: boolean
  // for 'unclear': the other school that may serve this spot (today's school)
  alternatives?: string[]
}
export type Assignments = Record<Scenario, Record<Band, Assignment>>
export function shortName(name: string): string
export function assignmentsAt(datasets: Record<string, FeatureCollection>, point: [number, number]): Assignments
