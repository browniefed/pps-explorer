"""Compare our Status Quo layers with the City of Portland's School_Boundaries layer.

Usage: python -I verify_city.py reference/city_school_boundaries.geojson ../../public/data

The city layer (School_Attendance_Areas, last edited Nov 2025) holds one polygon per "cell" with
its elementary, middle and high school assignment. Source, as used by ppsdata.info (meub/pps-data):
https://services.arcgis.com/quVN97tn06YNGj9s/arcgis/rest/services/School_Boundaries/FeatureServer/0
Refresh with:
  curl -o reference/city_school_boundaries.geojson "<source>/query?where=Unified_SD_Name%3D%27Portland+SD+1J%27&outFields=*&returnGeometry=true&outSR=4326&f=geojson"

Prints, per grade band, the share of the district where both datasets name the same school and the
schools that disagree most. Known differences (Oct 2026): the PPS status quo map gives Roseway Heights
(6-8) the Cully/airport strip the city layer assigns to Beaumont, and the city layer splits Jefferson
into "Jefferson / Grant", "Jefferson / McDaniel" and "Jefferson / Roosevelt" choice zones.
"""
import json, re, sys
from collections import defaultdict
from shapely.geometry import shape
from shapely.ops import unary_union, transform
from pyproj import Transformer

cells = json.load(open(sys.argv[1]))["features"]
ours_dir = sys.argv[2]
tr = Transformer.from_crs(4326, 2913, always_xy=True)
P = lambda g: transform(lambda x, y, z=None: tr.transform(x, y), g)
SQFT_PER_SQMI = 27878400
norm = lambda s: re.sub(r"[^a-z]", "", s.lower().replace("dr. martin luther king jr.", "mlkjr").replace("martin luther king jr", "mlkjr").replace("césar chávez", "cesarchavez").replace("robert gray", "gray"))

# City layer names (older or abbreviated) -> names used on the PPS 2026 maps
ALIAS = {"lee": "sunrise", "lane": "brentwood", "tubman": "harriettubman", "idabwells": "wellsbarnett",
         "bridger": "bridgercreativescience", "sunnyside": "sunnysideenvironmental",
         "jeffersongrant": "jefferson", "jeffersonroosevelt": "jefferson", "jeffersonmcdaniel": "jefferson"}


def key(name):
    # our names: "Abernethy Elementary", "Astor K-8", "Hosford Middle School", "Cleveland High School"
    return norm(re.sub(r" (Elementary|Middle School|High School|K-8)$", "", name))

for band, field in (("k5", "Grade_1_Choice1_Name"), ("68", "Grade_6_Choice1_Name"), ("912", "Grade_10_Choice1_Name")):
    off = defaultdict(list)
    for c in cells:
        n = c["properties"].get(field)
        if n: off[ALIAS.get(norm(n), norm(n))].append(P(shape(c["geometry"]).buffer(0)))
    off = {k: unary_union(v) for k, v in off.items()}
    mine = {key(f["properties"]["name"]): P(shape(f["geometry"]).buffer(0)) for f in json.load(open(f"{ours_dir}/sq_{band}.geojson"))["features"]}
    district = unary_union(list(off.values()))
    agree = 0.0
    rows = []
    for k in sorted(set(off) | set(mine)):
        a, b = off.get(k), mine.get(k)
        if a is None or b is None:
            rows.append((k, None, (a or b).area / SQFT_PER_SQMI, "only official" if a is not None else "only ours"))
            continue
        inter = a.intersection(b).area
        agree += inter
        rows.append((k, inter / a.union(b).area, a.symmetric_difference(b).area / SQFT_PER_SQMI, ""))
    print(f"== {band}: official {len(off)} schools, ours {len(mine)}; area where both name the same school: {agree / district.area:.1%} of district")
    for k, iou, diff, note in sorted(rows, key=lambda r: (r[1] is not None, r[1] or 0)):
        if note or iou < 0.97:
            print(f"   {k:28s} IoU {'-' if iou is None else f'{iou:.3f}'}  mismatch {diff:.2f} sq mi {note}")
