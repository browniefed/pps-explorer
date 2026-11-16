import type { Lang } from './i18n.mjs'
import type { Assignments, Scenario } from './assignments.mjs'
export type ChangeEvent =
  | { kind: 'close'; school: string; to?: string[]; detail?: string; detail_es?: string; source: string; year?: number }
  | { kind: 'program'; program: string; from: string[]; to: string; detail?: string; detail_es?: string; source: string; year?: number }
  | { kind: 'grades'; school: string; to: string; source: string; year?: number }
  | { kind: 'note'; schools: string[]; text: string; text_es?: string; source: string; year?: number }
export type SpotNote = { school: string; text: string }
export function schoolKey(name: string): string
export function describe(e: ChangeEvent, key?: string, lang?: Lang): string
export function programName(program: string, lang: Lang): string
export function eventsFor(scenario: Scenario, name: string): ChangeEvent[]
export function closes(scenario: Scenario, name: string): boolean
export function spotNotes(scenario: Scenario, results: Assignments | null, areaNames: Record<string, Set<string>>, labels?: Record<string, Record<string, string>>, lang?: Lang): SpotNote[]
export function dated(e: ChangeEvent, text: string, lang?: Lang): string
export function digest(scenario: Scenario, year?: number | null): { closures: ChangeEvent[]; programs: ChangeEvent[]; grades: ChangeEvent[]; notes: ChangeEvent[] }
