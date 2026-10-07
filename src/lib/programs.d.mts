import type { FeatureCollection } from 'geojson'
import type { Scenario } from './assignments.mjs'
export const PROGRAM_COLORS: Record<string, string>
export type ImmersionSite = { key: string; name: string; short: string; languages: string[]; coords: [number, number]; ownArea: boolean }
export type ProgramMove = { program: string; kind: string | null; color: string; fromName: string; toName: string; from: [number, number]; to: [number, number] }
export function languagesOf(label: string): string[]
export function programKind(program: string): string | null
export function immersionSites(schools: FeatureCollection, areaKeys: Set<string>): ImmersionSite[]
export function programMoves(scenario: Scenario, layers: { scenarioSchools?: FeatureCollection; sqSchools?: FeatureCollection }): ProgramMove[]
export const CLOSURE_COLOR: string
export function closureMoves(scenario: Scenario, layers: { scenarioSchools?: FeatureCollection; sqSchools?: FeatureCollection }): (ProgramMove & { detail?: string })[]
