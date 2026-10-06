import type { Assignments, Scenario } from './assignments.mjs'
export type ChangeEvent =
  | { kind: 'close'; school: string; to?: string[]; detail?: string; source: string }
  | { kind: 'program'; program: string; from: string[]; to: string; detail?: string; source: string }
  | { kind: 'grades'; school: string; to: string; source: string }
  | { kind: 'note'; schools: string[]; text: string; source: string }
export type SpotNote = { school: string; text: string }
export function schoolKey(name: string): string
export function describe(e: ChangeEvent, key?: string): string
export function eventsFor(scenario: Scenario, name: string): ChangeEvent[]
export function closes(scenario: Scenario, name: string): boolean
export function spotNotes(scenario: Scenario, results: Assignments | null, areaNames: Record<string, Set<string>>): SpotNote[]
export function digest(scenario: Scenario): { closures: ChangeEvent[]; programs: ChangeEvent[]; grades: ChangeEvent[]; notes: ChangeEvent[] }
