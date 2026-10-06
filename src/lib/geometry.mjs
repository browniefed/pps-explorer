// Returns all intersecting shapes: overlaps are never silently resolved.
export function inRing(ring,[x,y]){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [ax,ay]=ring[i],[bx,by]=ring[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside}return inside}
export function contains(geometry,point){const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];return polygons.some(rings=>inRing(rings[0],point)&&!rings.slice(1).some(ring=>inRing(ring,point)))}
export function lookup(collection,point){return collection.features.filter(feature=>feature.geometry&&contains(feature.geometry,point))}
