"""Spanish dual-language immersion (DLI) elementary sites and their 1-mile reach, 2022 to the scenarios.

Usage: python -I dli.py <data_dir> <district.geojson> <water.geojson>

Writes <data_dir>/dli_reach.json. Oregon law (ORS 327.043) requires districts to transport elementary
students who live more than one mile from school, so a 1-mile circle around each site roughly marks
where students could walk. Circles are straight-line; the law measures along a reasonable route, so
real walking reach is smaller.

Sites per period:
- sq, a, b: elementary schools labelled "Spanish Immersion" on that scenario's K-5 map. The status quo
  set matches PPS's "Enrollment Details for Language Immersion Schools, October 2025".
- 2022: the status quo set plus Bridger, whose Spanish immersion (190 students in 2022-23) moved to
  Lent in fall 2023.
"""
import json
import re
import sys

from pyproj import Transformer
from shapely.geometry import Point, shape
from shapely.ops import transform, unary_union

MILE_FT = 5280
SQ_MI_FT = MILE_FT ** 2
EXTRA_2022 = {"Bridger Creative Science": "Spanish immersion moved to Lent in fall 2023"}


def short(name):
    return re.split(r"\s(K-5|K-8|K-12|School)\b", name)[0]


def main(data_dir, district_path, water_path):
    to_ft = Transformer.from_crs(4326, 2913, always_xy=True)
    ft = lambda g: transform(lambda x, y, z=None: to_ft.transform(x, y), g)
    district = unary_union([ft(shape(c["geometry"]).buffer(0)) for c in json.load(open(district_path))["features"]])
    land = district.difference(ft(shape(json.load(open(water_path))["geometry"]).buffer(0)))

    points, sites = {}, {}
    for sc in ("sq", "a", "b"):
        feats = json.load(open(f"{data_dir}/{sc}_k5_schools.geojson"))["features"]
        for f in feats:
            points.setdefault(short(f["properties"]["name"]), f["geometry"]["coordinates"])
        sites[sc] = sorted(short(f["properties"]["name"]) for f in feats if "Spanish Immersion" in f["properties"]["name"])
    sites["2022"] = sorted(sites["sq"] + list(EXTRA_2022))

    out = {"radius_miles": 1, "land_sq_mi": round(land.area / SQ_MI_FT, 1), "periods": {}}
    for period in ("2022", "sq", "a", "b"):
        reach = unary_union([ft(Point(points[n])).buffer(MILE_FT, 64) for n in sites[period]]).intersection(land)
        out["periods"][period] = {
            "sites": [{"name": n, "coords": points[n], "note": EXTRA_2022.get(n) if period == "2022" else None} for n in sites[period]],
            "reach_sq_mi": round(reach.area / SQ_MI_FT, 1),
            "reach_share": round(reach.area / land.area, 3),
        }
        print(f"{period:5s} {len(sites[period]):2d} sites, {reach.area / SQ_MI_FT:5.1f} sq mi = {reach.area / land.area:.0%} of PPS land: {', '.join(sites[period])}")
    json.dump(out, open(f"{data_dir}/dli_reach.json", "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
