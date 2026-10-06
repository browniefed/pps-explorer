// Point-in-polygon and edge-distance helpers for GeoJSON [lng, lat] coordinates.

export function inRing(ring, [x, y]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i], [bx, by] = ring[j]
    if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside
  }
  return inside
}

function polygonsOf(geometry) {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []
}

export function contains(geometry, point) {
  return polygonsOf(geometry).some((rings) => inRing(rings[0], point) && !rings.slice(1).some((ring) => inRing(ring, point)))
}

// Returns all containing features: overlaps are never silently resolved.
export function lookup(collection, point) {
  return collection.features.filter((feature) => feature.geometry && contains(feature.geometry, point))
}

// Distance in metres from a point to a feature's nearest edge (equirectangular; fine at city scale).
export function edgeDistance(geometry, [lng, lat]) {
  const kx = 111320 * Math.cos((lat * Math.PI) / 180), ky = 110540
  let best = Infinity
  for (const rings of polygonsOf(geometry))
    for (const ring of rings)
      for (let i = 1; i < ring.length; i++) {
        const ax = (ring[i - 1][0] - lng) * kx, ay = (ring[i - 1][1] - lat) * ky
        const bx = (ring[i][0] - lng) * kx, by = (ring[i][1] - lat) * ky
        const dx = bx - ax, dy = by - ay
        const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)))
        best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy))
      }
  return best
}

// Nearest feature whose edge is within maxMetres, for points on a hairline sliver between areas.
export function nearest(collection, point, maxMetres) {
  let best = null, bestDistance = maxMetres
  for (const feature of collection.features) {
    const d = feature.geometry ? edgeDistance(feature.geometry, point) : Infinity
    if (d < bestDistance) { bestDistance = d; best = feature }
  }
  return best
}
