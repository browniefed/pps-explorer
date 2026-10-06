import { lookup } from './geometry.mjs'
export const levels=['elementary','middle','high']
export const scenarios=['current','a','b']
export function assignmentsAt(datasets,point){return Object.fromEntries(scenarios.map(s=>[s,Object.fromEntries(levels.map(level=>{const fc=datasets[`${s}-${level}`];if(!fc)return[level,{status:'unavailable',schools:[]}];const hits=lookup(fc,point),schools=[...new Set(hits.flatMap(f=>f.properties?.school_name?[f.properties.school_name]:f.properties?.school_candidates??[]))].sort();return[level,{status:schools.length===1?'matched':schools.length>1?'ambiguous':'unresolved',schools,unresolvedShapes:hits.filter(f=>!f.properties?.school_name).length}]}))]))}
