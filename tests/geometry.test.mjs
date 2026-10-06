import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contains, lookup } from '../src/lib/geometry.mjs'
const outer=[[0,0],[10,0],[10,10],[0,10],[0,0]],hole=[[3,3],[7,3],[7,7],[3,7],[3,3]]
test('polygon lookup excludes holes and outside points',()=>{const g={type:'Polygon',coordinates:[outer,hole]};assert(contains(g,[1,1]));assert(!contains(g,[5,5]));assert(!contains(g,[11,5]))})
test('overlapping polygons return all matches',()=>{const f={type:'Feature',geometry:{type:'Polygon',coordinates:[outer]},properties:{}};assert.equal(lookup({features:[f,f]},[1,1]).length,2)})
test('all nine extracted datasets have closed finite geographic rings and remain unreviewed',()=>{const manifest=JSON.parse(readFileSync('public/data/manifest.json'));assert.equal(manifest.length,9);for(const m of manifest){assert.equal(m.reviewed,false);const data=JSON.parse(readFileSync('public'+m.url));assert(data.features.length>0);assert.equal(data.features.length,m.features);for(const f of data.features){if(f.properties.school_name){assert.equal(f.properties.name_status,'pdf-label-match');assert(f.properties.school_candidates.includes(f.properties.school_name));}else assert(['ambiguous','unresolved'].includes(f.properties.name_status));for(const ring of f.geometry.coordinates){assert(ring.length>=4);assert.deepEqual(ring[0],ring.at(-1));for(const [lon,lat]of ring){assert(Number.isFinite(lon)&&Number.isFinite(lat));assert(lon>-123&&lon< -122.4&&lat>45.35&&lat<45.8)}}}}})
