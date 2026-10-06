import type { FeatureCollection, Feature, Geometry } from 'geojson'
export function inRing(ring: number[][], point: [number, number]): boolean
export function contains(geometry: Geometry, point: [number, number]): boolean
export function lookup(collection: FeatureCollection, point: [number, number]): Feature[]
export function edgeDistance(geometry: Geometry, point: [number, number]): number
export function nearest(collection: FeatureCollection, point: [number, number], maxMetres: number): Feature | null
