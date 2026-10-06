"""Build GeoJSON layers from extracted raw page features + georeference.

Usage: python -I build.py <raw_dir> <georef.json> <out_dir>
"""
import json
import re
import sys

import numpy as np
from pyproj import Transformer
from shapely import affinity
from shapely.geometry import MultiPolygon, Point, Polygon, box, mapping
from shapely.ops import transform as shp_transform, unary_union

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from extract import INSET_BOX, INSET_FRAME, MAIN_FRAME  # noqa: E402
from labels import pair_labels_icons, school_key  # noqa: E402

SCENARIOS = {"sq": "Status Quo", "a": "Scenario A", "b": "Scenario B"}
BANDS = {"k5": ("K-5", ["K-5", "K-8"]), "68": ("6-8", ["6-8", "K-8"]), "912": ("9-12", [])}
MAIN_REGION = box(*MAIN_FRAME).difference(box(*INSET_BOX))
INSET_REGION = box(*INSET_FRAME)


def _affine(a):
    A = np.array(a)  # rows: x, y, 1 -> X, Y
    return [A[0, 0], A[1, 0], A[0, 1], A[1, 1], A[2, 0], A[2, 1]]


class Geo:
    """Page -> lon/lat using the GeoPDF viewports: one affine for the main map, one for the NW inset."""

    def __init__(self, g):
        self.main = _affine(g["main"]["affine"])
        self.inset = _affine(g["inset"]["affine"])
        tr = Transformer.from_crs(g["epsg"], 4326, always_xy=True)
        self.to_ll = lambda x, y, z=None: tr.transform(x, y)
        # in projected coords: the inset only contributes what the main map doesn't show
        self.main_proj = affinity.affine_transform(MAIN_REGION, self.main)
        self.inset_only = affinity.affine_transform(INSET_REGION, self.inset).difference(self.main_proj)
        self.main_edge = shp_transform(self.to_ll, affinity.affine_transform(box(*MAIN_FRAME).exterior, self.main))

    def page_to_ll(self, geom, frame):
        if frame == "inset":
            geom = affinity.affine_transform(geom.intersection(INSET_REGION), self.inset).intersection(self.inset_only)
        else:
            geom = affinity.affine_transform(geom.intersection(MAIN_REGION), self.main)
        return shp_transform(self.to_ll, geom)

    def point_ll(self, x, y, frame):
        p = affinity.affine_transform(Point(x, y), self.inset if frame == "inset" else self.main)
        return shp_transform(self.to_ll, p)


def on_edge(p, rect, tol=5.0):
    x, y = p
    return min(abs(x - rect[0]), abs(x - rect[2]), abs(y - rect[1]), abs(y - rect[3])) < tol


def rings_to_poly(rings, require_closed=False, frame_rect=None):
    geom = None
    for r in rings:
        if len(r) < 3:
            continue
        # an outline clipped by the map frame starts and ends on the frame edge; closing it is safe
        clipped = frame_rect is not None and on_edge(r[0], frame_rect) and on_edge(r[-1], frame_rect)
        if require_closed and not clipped and np.hypot(r[0][0] - r[-1][0], r[0][1] - r[-1][1]) > 1.0:
            continue
        p = Polygon(r).buffer(0)
        if p.is_empty:
            continue
        geom = p if geom is None else geom.symmetric_difference(p)
    return geom


def polys_only(g):
    if g.is_empty:
        return g
    if g.geom_type == "GeometryCollection":
        g = unary_union([x for x in g.geoms if x.geom_type in ("Polygon", "MultiPolygon")])
    return g


def clean(g, tol=0.00002):
    g = polys_only(g.buffer(0)).simplify(tol, preserve_topology=True)
    if g.geom_type == "Polygon":
        g = MultiPolygon([g])
    parts = [p for p in g.geoms if p.area > 2e-8]  # drop slivers (~200 m2)
    return MultiPolygon(parts) if parts else None


def round_geom(geojson):
    def r(c):
        return [r(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 6), round(c[1], 6)]
    geojson["coordinates"] = r(geojson["coordinates"])
    return geojson


def school_kind(text):
    if "Closed" in text:
        return "closed"
    if "Focus" in text or "Option" in text:
        return "focus"
    if "High School" in text:
        return "high"
    if "Middle School" in text:
        return "middle"
    if "K-8" in text:
        return "k8"
    if "K-5" in text:
        return "k5"
    return "other"


def build(raw, geo, band):
    _, layers = BANDS[band]
    feats = []

    # schools (points with labels)
    schools = []
    for frame in ("main", "inset"):
        for p in pair_labels_icons(raw, frame) if frame == "main" else pair_inset(raw):
            ll = geo.point_ll(p["x"], p["y"], frame)
            schools.append({"name": p["text"], "kind": school_kind(p["text"]), "pt": ll})

    # high school clusters
    clusters = {}
    for c in raw["clusters"]:
        poly = rings_to_poly(c["rings"])
        if poly is None:
            continue
        clusters.setdefault(c["cluster"], []).append(geo.page_to_ll(poly, c["frame"]))
    clusters = {k: clean(unary_union(v)) for k, v in clusters.items()}
    clusters = {k: v for k, v in clusters.items() if v is not None}

    if band == "912":
        for name, g in clusters.items():
            hs = next((s["name"] for s in schools if s["kind"] == "high" and s["name"].startswith(name)), f"{name} High School")
            feats.append(("area", name, {"name": hs.split(" Immersion")[0].replace(" Spanish", "").replace(" Mandarin", "").replace(" Japanese", "").replace(" Russian", ""),
                                         "school_label": hs, "cluster": name, "level": "9-12"}, g))
    else:
        pieces = []
        for a in raw["areas"]:
            if a["layer"] not in layers:
                continue
            poly = rings_to_poly(a["rings"], require_closed=True,
                                 frame_rect=INSET_FRAME if a["frame"] == "inset" else MAIN_FRAME)
            if poly is None:
                continue
            g = polys_only(geo.page_to_ll(poly, a["frame"]).buffer(0))
            if not g.is_empty:
                pieces.append({"layer": a["layer"], "geom": g})
        named = {}
        unnamed = []
        for pc in pieces:
            inside = [s for s in schools if pc["geom"].contains(s["pt"])]
            want = {"K-5": ("k5",), "6-8": ("middle",), "K-8": ("k8",)}[pc["layer"]]
            cands = [s for s in inside if s["kind"] in want]
            # prefer neighborhood schools; immersion-only schools share someone else's area
            cands.sort(key=lambda s: (0 if "Neighborhood" in s["name"] else 1, len(s["name"])))
            if not cands:
                cands = [s for s in inside if s["kind"] not in ("closed",)] or inside
            if cands:
                # key by school only: a K-8 area may be outlined by both a K-5 ring and a K-8 dashed ring
                key = school_key(cands[0]["name"])
                layer = "K-8" if cands[0]["kind"] == "k8" else pc["layer"]
                ent = named.setdefault(key, {"geom": [], "label": cands[0]["name"], "layer": layer})
                ent["geom"].append(pc["geom"])
                if layer == "K-8":
                    ent["layer"], ent["label"] = "K-8", cands[0]["name"]
            else:
                unnamed.append(pc)
        merged = {k: unary_union(v["geom"]) for k, v in named.items()}
        edge = geo.main_edge.buffer(0.0003)
        for pc in unnamed:  # clipped fragments (e.g. main-map edge of an inset area): attach to best neighbour
            def contact(k, zone=None):
                g = merged[k].buffer(0.0005).intersection(pc["geom"])
                return (g.intersection(zone) if zone is not None else g).area
            # prefer the area that continues across the main-map frame edge (i.e. into the inset)
            best = max(merged, key=lambda k: contact(k, edge), default=None)
            if best is None or contact(best, edge) == 0:
                best = max(merged, key=contact, default=None)
            if best and merged[best].buffer(0.0005).intersection(pc["geom"]).area > 0:
                merged[best] = unary_union([merged[best], pc["geom"]])
                named[best]["geom"].append(pc["geom"])
            else:
                print("   unlabeled area dropped", pc["layer"], round(pc["geom"].area * 1e6, 2))
        for key, g in merged.items():
            g = clean(g)
            if g is None:
                continue
            cl = max(clusters, key=lambda k: clusters[k].intersection(g).area)
            label, layer = named[key]["label"], named[key]["layer"]
            level = "K-8" if layer == "K-8" else BANDS[band][0]
            suffix = "K-8" if layer == "K-8" else ("Middle School" if band == "68" else "Elementary")
            feats.append(("area", key, {"name": f"{key} {suffix}", "school_label": label, "cluster": cl, "level": level}, g))

    out = []
    for _, _, props, g in feats:
        props["area_sqmi"] = round(area_sqmi(g), 2)
        out.append({"type": "Feature", "properties": props, "geometry": round_geom(mapping(g))})
    out.sort(key=lambda f: f["properties"]["name"])
    pts = [{"type": "Feature", "properties": {"name": s["name"], "kind": s["kind"]},
            "geometry": round_geom(mapping(s["pt"]))} for s in schools]
    return out, pts, clusters


def pair_inset(raw):
    return pair_labels_icons_frame(raw, "inset", INSET_FRAME)


def pair_labels_icons_frame(raw, frame, rect):
    icons = [i for i in raw["icons"] if i["frame"] == frame]
    out = []
    for lab in raw["labels"]:
        x0, y0, x1, y1 = lab["bbox"]
        if not (rect[0] <= x0 and x1 <= rect[2] and rect[1] <= y0 and y1 <= rect[3]):
            continue
        best = min(icons, key=lambda i: np.hypot(max(x0 - i["x"], 0, i["x"] - x1), max(y0 - i["y"], 0, i["y"] - y1)), default=None)
        if best:
            out.append({"text": lab["text"], "x": best["x"], "y": best["y"]})
    return out


_eq = Transformer.from_crs(4326, 6933, always_xy=True)  # equal-area


def area_sqmi(g):
    return shp_transform(lambda x, y, z=None: _eq.transform(x, y), g).area / 2589988.11


def main(raw_dir, georef_path, out_dir):
    geo = Geo(json.load(open(georef_path)))
    index = {"scenarios": SCENARIOS, "bands": {k: v[0] for k, v in BANDS.items()}, "layers": {}}
    for sc in SCENARIOS:
        for band in BANDS:
            raw = json.load(open(f"{raw_dir}/{sc}_{band}.json"))
            areas, pts, clusters = build(raw, geo, band)
            json.dump({"type": "FeatureCollection", "features": areas}, open(f"{out_dir}/{sc}_{band}.geojson", "w"), separators=(",", ":"))
            json.dump({"type": "FeatureCollection", "features": pts}, open(f"{out_dir}/{sc}_{band}_schools.geojson", "w"), separators=(",", ":"))
            index["layers"][f"{sc}_{band}"] = {"areas": len(areas), "schools": len(pts)}
            print(f"{sc}_{band}: {len(areas)} areas, {len(pts)} schools; clusters {sorted(clusters)}")
    json.dump(index, open(f"{out_dir}/index.json", "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
