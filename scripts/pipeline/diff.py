"""Where does the assigned school change from status quo? One GeoJSON per scenario and grade band.

Usage: python -I diff.py <data_dir> [water.geojson]

Writes <data_dir>/{a,b}_{k5,68,912}_changed.geojson: polygons where the scenario assigns a different
school than status quo, with `from` and `to` school names. Schools are compared by name without the
level suffix, so "Faubion K-8" -> "Faubion Elementary" (a grade change, not a move) doesn't count.
The status quo and scenario maps trace the same lines from different PDFs, so shared boundaries can
differ by a few metres; a small inward buffer removes those slivers.
"""
import json
import re
import sys

from shapely.geometry import mapping, shape
from shapely.ops import unary_union

SLIVER = 0.00012   # degrees (~10 m): erode then dilate to drop thin slivers along shared edges
MIN_AREA = 4e-7    # degrees^2 (~3,500 m2): ignore crumbs left after that
SQ_MI = 2.59e6 / (111_100 * 77_900)  # one square mile in degrees^2 at Portland's latitude
SURE = 0.1 * SQ_MI  # changes this big are kept on the map's word alone

# Schools the district-wide comparison (Oct 4, 2026) lists under boundary changes or closures. A small
# change area whose two schools are both missing here is a tracing difference between the PDFs (e.g.
# where the NW inset meets the main map), not a proposed change. Large areas are kept regardless: the
# Scenario B map moves Rigler's area into Scott's although the B list names neither school.
LISTED = {
    "a": """Abernethy Arleta Astor Atkinson Beaumont Beverly-Cleary Brentwood Capitol-Hill Chief-Joseph Cleveland
            MLK-Jr Duniway Faubion Franklin George Harriet-Tubman Harrison-Park Hayhurst Hosford Jackson Jefferson
            Kellogg Kelly Lent Lincoln Llewellyn Markham McDaniel Mt-Tabor Ockley-Green Rieke Gray Roosevelt
            Rosa-Parks Scott Sitton Sunnyside-Environmental Whitman
            Beach Buckman Creston Irvington James-John Lewis Maplewood Marysville Peninsula Rose-City-Park Sabin
            Sellwood Stephenson Woodmere""",
    "b": """Abernethy Arleta Astor Atkinson Beaumont Beverly-Cleary Brentwood Chief-Joseph Cleveland MLK-Jr Faubion
            Franklin George Harriet-Tubman Harrison-Park Hayhurst Hosford Jackson Jefferson Kellogg Kelly Lent Lewis
            Lincoln McDaniel Mt-Tabor Ockley-Green Rieke Gray Roosevelt Rosa-Parks Sitton Sunnyside-Environmental
            Whitman
            Beach Buckman Creston Irvington James-John Maplewood Marysville Peninsula Sabin Sellwood Woodmere""",
}
LISTED = {k: {w.replace("-", " ") for w in v.split()} for k, v in LISTED.items()}


def key(name):
    return re.sub(r" (Elementary|Middle School|High School|K-8)$", "", name)


def listed(sc, name):
    return key(name) in LISTED[sc]


def load(path):
    return [(f["properties"]["name"], shape(f["geometry"]).buffer(0), f["properties"].get("unclear_between", []))
            for f in json.load(open(path))["features"]]


def rounded(geom):
    def r(c):
        return [r(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 6), round(c[1], 6)]
    g = mapping(geom)
    g["coordinates"] = r(g["coordinates"])
    return g


def main(data_dir, water_path=None):
    # rivers: the maps split the Willamette and Columbia differently, which isn't a change for any family
    water = shape(json.load(open(water_path))["geometry"]).buffer(0) if water_path else None
    for band in ("k5", "68", "912"):
        sq = load(f"{data_dir}/sq_{band}.geojson")
        for sc in ("a", "b"):
            feats = []
            for to_name, to_geom, unclear in load(f"{data_dir}/{sc}_{band}.geojson"):
                for from_name, from_geom, _ in sq:
                    if key(from_name) == key(to_name) or not from_geom.intersects(to_geom):
                        continue
                    if key(from_name) in unclear:  # the map doesn't say whether this school's area really moves
                        print(f"   unclear {sc}_{band} {from_name} -> {to_name}: not hatched")
                        continue
                    g = from_geom.intersection(to_geom)
                    if water is not None:
                        g = g.difference(water)
                    g = g.buffer(-SLIVER).buffer(SLIVER)
                    parts = [p for p in getattr(g, "geoms", [g]) if p.geom_type == "Polygon" and p.area >= MIN_AREA]
                    if not parts:
                        continue
                    g = unary_union(parts).simplify(0.00002, preserve_topology=True)
                    if g.area < SURE and not (listed(sc, from_name) or listed(sc, to_name)):
                        print(f"   skip {sc}_{band} {from_name} -> {to_name}: {g.area / SQ_MI:.3f} sq mi, neither school listed")
                        continue
                    feats.append({"type": "Feature", "properties": {"from": from_name, "to": to_name},
                                  "geometry": rounded(g)})
            json.dump({"type": "FeatureCollection", "features": feats},
                      open(f"{data_dir}/{sc}_{band}_changed.geojson", "w"), separators=(",", ":"))
            print(f"{sc}_{band}_changed: {len(feats)} areas where the school changes")


if __name__ == "__main__":
    main(*sys.argv[1:])
