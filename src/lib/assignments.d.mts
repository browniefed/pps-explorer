import type { FeatureCollection } from 'geojson'
export const levels: readonly ['elementary','middle','high']
export const scenarios: readonly ['current','a','b']
export type Assignment = {status:'matched'|'ambiguous'|'unresolved'|'unavailable';schools:string[];unresolvedShapes?:number}
export type Assignments = Record<'current'|'a'|'b',Record<'elementary'|'middle'|'high',Assignment>>
export function assignmentsAt(datasets:Record<string,FeatureCollection>,point:[number,number]):Assignments
