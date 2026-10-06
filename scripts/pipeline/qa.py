"""Coverage QA: compare each layer's areas to the district (union of 9-12 clusters)."""
import json, sys
from itertools import combinations
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from pyproj import Transformer
from shapely.ops import transform
eq = Transformer.from_crs(4326, 6933, always_xy=True)
sqmi = lambda g: transform(lambda x, y, z=None: eq.transform(x, y), g).area / 2589988
d = sys.argv[1]
for sc in ("sq", "a", "b"):
    district = unary_union([shape(f["geometry"]) for f in json.load(open(f"{d}/{sc}_912.geojson"))["features"]])
    for band in ("k5", "68", "912"):
        fs = json.load(open(f"{d}/{sc}_{band}.geojson"))["features"]
        gs = [(f["properties"]["name"], shape(f["geometry"]).buffer(0)) for f in fs]
        u = unary_union([g for _, g in gs])
        gap = district.difference(u)
        ov = [(a, b, sqmi(ga.intersection(gb))) for (a, ga), (b, gb) in combinations(gs, 2)]
        ov = [o for o in ov if o[2] > 0.01]
        big = sorted([p for p in getattr(gap, "geoms", [gap]) if sqmi(p) > 0.02], key=sqmi, reverse=True)[:4]
        print(f"{sc}_{band}: district {sqmi(district):.1f}  covered {sqmi(u):.1f}  gap {sqmi(gap):.2f}  outside {sqmi(u.difference(district)):.2f}  overlaps {[(a,b,round(x,2)) for a,b,x in ov]}")
        for p in big:
            c = p.representative_point(); print(f"     gap {sqmi(p):.2f} at {c.y:.4f},{c.x:.4f}")
