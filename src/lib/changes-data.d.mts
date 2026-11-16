import type { ChangeEvent } from './changes.mjs'
export const SOURCES: Record<'memo' | 'region' | 'rec', string>
type ScenarioSummary = {
  closures: number; boundaryChanges: number; programMoves: number; gradeChanges: number
  studentsChangingSchools: number; studentsInSustainableSchools: number
}
type RecSummary = {
  closures: number; closures2027: number; closures2028: number; studentsChangingSchools: number
  k5SchoolsSustainable: number; k5SchoolsSustainableSq: number
}
export const SUMMARY: Record<'sq' | 'a' | 'b', ScenarioSummary> & { r: RecSummary }
export const CHANGES: Record<'a' | 'b' | 'r', ChangeEvent[]>
