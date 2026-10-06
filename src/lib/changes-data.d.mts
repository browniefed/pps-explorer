import type { ChangeEvent } from './changes.mjs'
export const SOURCES: Record<'memo' | 'region', string>
export const SUMMARY: Record<'sq' | 'a' | 'b', {
  closures: number; boundaryChanges: number; programMoves: number; gradeChanges: number
  studentsChangingSchools: number; studentsInSustainableSchools: number
}>
export const CHANGES: Record<'a' | 'b', ChangeEvent[]>
