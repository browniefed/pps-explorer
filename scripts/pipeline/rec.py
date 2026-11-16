"""Superintendent's Recommendation (Nov 13, 2026) as a fourth scenario, "r", in the same format as build.py.

Usage: python -I rec.py <data_dir> <recommendation.geojson> <district.geojson>

Unlike Scenarios A and B, PPS published these boundaries as GIS data: the "School Finder Rightsizing
Attendance Boundary" layer behind PPS's Rightsizing School Finder (reference/pps_recommendation_boundaries
.geojson, fetched Nov 16, 2026). It mixes three kinds of polygon:
  - scenario "No Change / Status Quo": an area that keeps its school, tagged by Type (K-5, K-8,
    Middle School, High School). Despite the name these are the recommended areas: Scott's covers
    Rigler's old area, since Rigler becomes a whole-school Spanish immersion hub.
  - scenario "Superintendent's Recommendation": an area that moves, School_From -> School_To, by Grades.
  - scenario "Jefferson Rising": the high school boundaries the board already approved.
Polygons named "... Dual Enrollment" overlap others: they mark where families may also choose
Jefferson. They're left out, as on the status quo map.

The layer has gaps and stale fields, handled here:
  - K-5 has no polygon for six schools that keep their area (Atkinson, Beverly Cleary, Bridger,
    Sunnyside, Vernon and most of Faubion): the gaps take the status quo school.
  - Laurelhurst still has a K-8 polygon; the memo moves its 6-8 to Mt. Tabor.
  - The memo moves rising 6th graders from the former Peninsula area to George, not Ockley Green.
  - The polygon labelled "Marysville -> Kelly" covers Lent's old area (Lent becomes a hub); only its
    geometry and School_To are used.
  - Years and immersion fields disagree with the memo in places, so they're not used. School labels
    (programs, closures, K-8 -> K-5) are set below from the memo, as of 2028-29 once every change is done.
"""
import json
import re
import sys

import shapely
from shapely.geometry import MultiPoint, mapping, shape
from shapely.ops import unary_union

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import build  # noqa: E402
from build import area_sqmi, clean, round_geom  # noqa: E402
from labels import school_key  # noqa: E402

# GIS name -> the name used on the PPS maps
def gis_name(n):
    n = re.sub(r"\s+(ES|MS|M\.S\.|K5|K-5|K-8|6-8)$", "", n.strip())
    return {"Beaumont M.S.": "Beaumont"}.get(n, n)


CLOSED = ["Beach", "Peninsula", "Sabin", "Creston", "Buckman", "Irvington", "Rose City Park", "Lewis", "Marysville", "Woodmere"]
WHOLE_SCHOOL = ["Rigler", "Lent", "César Chávez"]  # Spanish immersion hubs with no neighborhood area of their own
TO_K5 = ["Beverly Cleary", "César Chávez", "Faubion", "Laurelhurst", "Sunnyside Environmental", "Vernon", "Bridger Creative Science"]
# school label after every change (2028-29); unlisted schools keep their status quo label
K5_LABELS = {
    "Ainsworth": "Ainsworth K-5 Spanish Immersion",
    "César Chávez": "César Chávez K-5 Spanish Immersion",
    "Rigler": "Rigler K-5 Spanish Immersion",
    "Lent": "Lent K-5 Spanish Immersion",
    "Atkinson": "Atkinson K-5 Neighborhood",
    "James John": "James John K-5 Neighborhood",
    "Scott": "Scott K-5 Neighborhood",
    "Sitton": "Sitton K-5 Neighborhood",
    "Clark": "Clark K-5 Neighborhood",
    "Vestal": "Vestal K-5 Vietnamese Immersion",
    "MLK Jr": "MLK Jr K-5 Mandarin Immersion",
    "Woodstock": "Woodstock K-5 Mandarin Immersion",
    "Metro. Learning Center": "Metro. Learning Center K-8 Focus/Option",
}
MS_LABELS = {
    "Beaumont": "Beaumont Middle School Neighborhood",
    "Ockley Green": "Ockley Green Middle School Neighborhood",
    "George": "George Middle School Spanish Immersion",
    "Metro. Learning Center": "Metro. Learning Center K-8 Focus/Option",
}
BUILDING_CLOSED = {"Odyssey": "Odyssey Building Closed"}  # Odyssey moves to Forest Park; East Sylvan closes
BAND_TYPES = {"k5": ("K-5", "K-8"), "68": ("Middle School", "K-8"), "912": ("High School",)}
BAND_GRADES = {"k5": ("grK5", "grk8"), "68": ("gr68", "grk8"), "912": ("gr912",)}


def short(label):
    return school_key(label)


def relabel(label, band):
    k = short(label)
    if band == "912":
        return None if k == "Metro. Learning Center" else label  # MLC becomes K-8
    if k in CLOSED:
        return f"{k} School Closed"
    if k in BUILDING_CLOSED:
        return BUILDING_CLOSED[k]
    if k in TO_K5:
        return None if band == "68" else label.replace("K-8", "K-5")
    return (K5_LABELS if band == "k5" else MS_LABELS).get(k, label)


def pieces(feats, band):
    """(school, geometry) from the GIS layer for one grade band; moving areas cut through the rest."""
    base, moves = [], []
    for p, g in feats:
        sc = p.get("scenario") or ""
        if "Dual Enrollment" in (p.get("School") or ""):
            continue
        if sc.startswith("Superint") and p.get("Grades") in BAND_GRADES[band]:
            moves.append((gis_name(p["School_To"]), g))
        elif band == "912" and sc == "Jefferson Rising":
            base.append((gis_name(p["School"]), g))
        elif sc == "No Change / Status Quo" and p.get("Type") in BAND_TYPES[band]:
            name = gis_name(p["School"])
            if band == "68" and name == "Laurelhurst":
                name = "Mt Tabor"
            base.append((name, g))
    cut = unary_union([g for _, g in moves])
    out = [(n, g.difference(cut)) for n, g in base] + moves
    if band == "68":  # 2028-29: rising 6th graders from the former Peninsula area go to George
        pen = unary_union([g for p, g in feats if p.get("School_From") == "Peninsula" and p.get("Grades") == "grK5"])
        out = [(n, g.difference(pen)) for n, g in out] + [("George", pen)]
    return out


def nearest_split(geom, owners, step=0.0002):
    """Split `geom` among `owners` ({name: geometry}) by which owner's edge is nearest."""
    seen = {}  # one owner per coordinate: shared edges repeat points, which Voronoi rejects
    for n, g in owners.items():
        lines = [g.boundary] if g.boundary.geom_type == "LineString" else list(g.boundary.geoms)
        for line in lines:
            for x, y in shapely.segmentize(line, step).coords:
                seen.setdefault((round(x, 7), round(y, 7)), n)
    pts, names = list(seen), list(seen.values())
    cells = shapely.voronoi_polygons(MultiPoint(pts), extend_to=geom.envelope.buffer(0.01), ordered=True).geoms
    out = {}
    for n, cell in zip(names, cells):
        out.setdefault(n, []).append(cell)
    return {n: unary_union(cs).intersection(geom) for n, cs in out.items()}


def main(data_dir, rec_path, district_path):
    cells = json.load(open(district_path))["features"]
    district = unary_union([shape(c["geometry"]).buffer(0) for c in cells])
    build.DISTRICT = district.buffer(build.DISTRICT_TOLERANCE)
    feats = [(f["properties"], shape(f["geometry"]).buffer(0)) for f in json.load(open(rec_path))["features"]]

    index = json.load(open(f"{data_dir}/index.json"))
    index["scenarios"]["r"] = "Superintendent's Recommendation"
    hs = None
    for band in ("912", "k5", "68"):  # high school first: the other bands record their high school clusters
        sq = json.load(open(f"{data_dir}/sq_{band}.geojson"))["features"]
        sq_label = {short(f["properties"]["school_label"]): f["properties"]["school_label"] for f in sq}
        sq_pts = json.load(open(f"{data_dir}/sq_{band}_schools.geojson"))["features"]
        by_school = {}
        for name, g in pieces(feats, band):
            by_school.setdefault(name, []).append(g)
        merged = {n: unary_union(gs) for n, gs in by_school.items()}
        # Places the GIS layer leaves out (the K-5 gaps for six schools, plus spots neither source draws).
        # Each gap keeps PPS's edges: it goes whole to the status quo school covering it, or is split along
        # status quo lines when it holds more than one (the rest to the nearest of them); a gap with no open
        # status quo school joins the neighbour it borders most.
        rest = district.difference(unary_union(list(merged.values())))
        keeps = {short(f["properties"]["school_label"]): shape(f["geometry"]).buffer(0) for f in sq}
        keeps = {n: g for n, g in keeps.items() if n not in CLOSED and n not in WHOLE_SCHOOL}
        for gap in getattr(rest, "geoms", [rest]):
            if gap.geom_type != "Polygon" or area_sqmi(gap) < 0.005:
                continue
            owners = {n: g.intersection(gap) for n, g in keeps.items() if area_sqmi(g.intersection(gap)) >= 0.05}
            if len(owners) == 1:
                parts = {next(iter(owners)): gap}
            elif owners:
                parts = dict(owners)
                left = gap.difference(unary_union(list(owners.values())))
                if not left.is_empty:  # each leftover point goes to the nearest owner (Voronoi on their edges)
                    for n, g in nearest_split(left, owners).items():
                        parts[n] = unary_union([parts[n], g])
            else:
                best = max(merged, key=lambda n: merged[n].buffer(0.0003).intersection(gap).area)
                parts = {best: gap}
            for n, g in parts.items():
                c = g.representative_point()
                print(f"   r_{band}: {area_sqmi(g):.2f} sq mi not in the GIS layer at {c.y:.4f},{c.x:.4f} -> {n}")
                merged[n] = unary_union([merged[n], g]) if n in merged else g
        merged = {n: g for n, g in merged.items() if area_sqmi(g) >= 0.01}  # crumbs where the two sources' lines meet
        areas = []
        for name, g in sorted(merged.items()):
            g = clean(g)
            if g is None:
                continue
            k8 = band != "912" and name in ("Astor", "Skyline")
            level = "9-12" if band == "912" else "K-8" if k8 else build.BANDS[band][0]
            suffix = {"912": "High School", "68": "Middle School", "k5": "Elementary"}[band]
            label = sq_label.get(name) or next((p["properties"]["name"] for p in sq_pts if short(p["properties"]["name"]) == name), name)
            label = relabel(label, band) or label
            props = {"name": f"{name} {'K-8' if k8 else suffix}", "school_label": label, "level": level}
            if band == "912":
                props["cluster"] = name
            else:
                shares = {h["properties"]["cluster"]: shape(h["geometry"]).intersection(g).area / g.area for h in hs}
                split = [{"name": k, "share": round(v, 2)} for k, v in sorted(shares.items(), key=lambda kv: -kv[1]) if v >= 0.03]
                if not split:
                    print(f"   no high school for r_{band} {name} ({area_sqmi(g):.3f} sq mi), dropped")
                    continue
                props["cluster"], props["clusters"] = split[0]["name"], split
            props["area_sqmi"] = round(area_sqmi(g), 2)
            areas.append({"type": "Feature", "properties": props, "geometry": round_geom(mapping(g))})
        if band == "912":
            hs = areas
        pts = []
        for p in sq_pts:
            label = relabel(p["properties"]["name"], band)
            if label:
                pts.append({"type": "Feature", "properties": {"name": label, "kind": build.school_kind(label)}, "geometry": p["geometry"]})
        json.dump({"type": "FeatureCollection", "features": areas}, open(f"{data_dir}/r_{band}.geojson", "w"), separators=(",", ":"))
        json.dump({"type": "FeatureCollection", "features": pts}, open(f"{data_dir}/r_{band}_schools.geojson", "w"), separators=(",", ":"))
        index["layers"][f"r_{band}"] = {"areas": len(areas), "schools": len(pts)}
        print(f"r_{band}: {len(areas)} areas, {len(pts)} schools")
    json.dump(index, open(f"{data_dir}/index.json", "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
