"""Extract vector features (page coordinates) from a PPS ArcGIS attendance-boundary PDF.

Usage: python -I extract.py <pdf> <out.json>
"""
import json
import re
import sys

import pymupdf

MAIN_FRAME = (39.1, 36.0, 2551.8, 3024.0)
INSET_BOX = (59.0, 2102.2, 698.4, 2983.9)      # outer box covering main map
INSET_FRAME = (76.3, 2122.1, 673.5, 2964.0)     # inset map content

LAYER_COLORS = {
    (0.854, 0.67, 0.0): "K-5",
    (0.373, 0.063, 0.188): "K-8",
    (0.0, 0.613, 0.571): "6-8",
}


def rc(c):
    return tuple(round(v, 3) for v in c) if c else None


def in_rect(x, y, r):
    return r[0] <= x <= r[2] and r[1] <= y <= r[3]


def which_frame(rect):
    cx, cy = (rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2
    if in_rect(cx, cy, INSET_FRAME):
        return "inset"
    if in_rect(cx, cy, MAIN_FRAME):
        return "main"
    return None


def path_rings(items):
    """Split drawing items into lists of (x, y) rings at discontinuities."""
    rings, cur, last = [], [], None
    for it in items:
        kind = it[0]
        if kind == "re":
            r = it[1]
            rings.append([(r.x0, r.y0), (r.x1, r.y0), (r.x1, r.y1), (r.x0, r.y1)])
            last = None
            continue
        if kind == "qu":
            q = it[1]
            rings.append([(q.ul.x, q.ul.y), (q.ur.x, q.ur.y), (q.lr.x, q.lr.y), (q.ll.x, q.ll.y)])
            last = None
            continue
        start, end = it[1], it[-1]
        if last is None or abs(last.x - start.x) > 0.01 or abs(last.y - start.y) > 0.01:
            if len(cur) >= 2:
                rings.append(cur)
            cur = [(start.x, start.y)]
        if kind == "c":  # approximate bezier with its endpoints + control-point-free sampling
            p0, p1, p2, p3 = it[1], it[2], it[3], it[4]
            for t in (0.25, 0.5, 0.75):
                mt = 1 - t
                cur.append((
                    mt**3 * p0.x + 3 * mt**2 * t * p1.x + 3 * mt * t**2 * p2.x + t**3 * p3.x,
                    mt**3 * p0.y + 3 * mt**2 * t * p1.y + 3 * mt * t**2 * p2.y + t**3 * p3.y,
                ))
        cur.append((end.x, end.y))
        last = end
    if len(cur) >= 2:
        rings.append(cur)
    return rings


def near_edge(p, rect, tol=5.0):
    x, y = p
    return min(abs(x - rect[0]), abs(x - rect[2]), abs(y - rect[1]), abs(y - rect[3])) < tol


def chain_dashes(dashes, frame_rect, max_gap=20.0):
    """Pre-dashed outline (K-8): dash segments run in order around each ring, so chain them.

    A jump bigger than a dash gap starts a new ring; a ring ending within one gap of its
    start is closed explicitly.
    """
    rings = [list(dashes[0])]
    for d in dashes[1:]:
        lx, ly = rings[-1][-1]
        clipped = near_edge((lx, ly), frame_rect) and near_edge(d[0], frame_rect)  # runs along the frame edge
        if ((d[0][0] - lx) ** 2 + (d[0][1] - ly) ** 2) ** 0.5 > max_gap and not clipped:
            rings.append(list(d))
        else:
            rings[-1].extend(d)
    out = []
    for r in rings:
        if ((r[0][0] - r[-1][0]) ** 2 + (r[0][1] - r[-1][1]) ** 2) ** 0.5 <= max_gap * 1.5:
            r.append(r[0])
        out.append(r)
    return out


def legend(page, drawings):
    """Map fill color -> high school cluster name from legend swatches."""
    words = page.get_text("words")
    out = {}
    for x in drawings:
        r = x["rect"]
        if x.get("fill") and r.y0 > MAIN_FRAME[3] and 18 < r.width < 32 and 18 < r.height < 32 and r.x1 < 700:
            row = [w for w in words if abs((w[1] + w[3]) / 2 - (r.y0 + r.y1) / 2) < 10 and r.x1 < w[0] < r.x1 + 160]
            name = " ".join(w[4] for w in sorted(row, key=lambda w: w[0]))
            if name:
                out[rc(x["fill"])] = name
    return out


def labels(page):
    # work per text line: pymupdf blocks sometimes glue together lines of unrelated labels
    lines = []
    for b in page.get_text("dict")["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            spans = l["spans"]
            if not spans or any(abs(s["size"] - 12.0) > 0.2 or "Regular" not in s["font"] for s in spans):
                continue
            text = " ".join(s["text"] for s in spans).strip()
            bb = l["bbox"]
            if not text or which_frame(pymupdf.Rect(bb)) is None or text.startswith(("Version", "Rightsizing")):
                continue
            lines.append({"text": text, "bbox": list(bb), "last": list(bb)})
    # merge vertically stacked lines of the same label (centered, left- or right-aligned)
    lines.sort(key=lambda b: (b["bbox"][1], b["bbox"][0]))
    merged = []
    for b in lines:
        bb = b["bbox"]
        for m in merged:
            lb = m["last"]
            aligned = (abs((lb[0] + lb[2]) / 2 - (bb[0] + bb[2]) / 2) < 6 or abs(lb[0] - bb[0]) < 3
                       or abs(lb[2] - bb[2]) < 3)
            if -2 <= bb[1] - lb[3] < 3 and aligned:
                mb = m["bbox"]
                m["text"] += ("" if m["text"].endswith(("/", "-")) else " ") + b["text"]
                m["bbox"] = [min(mb[0], bb[0]), mb[1], max(mb[2], bb[2]), bb[3]]
                m["last"] = list(bb)
                break
        else:
            merged.append(dict(b))
    for m in merged:
        del m["last"]
    for m in merged:
        m["text"] = re.sub(r"\s+", " ", m["text"])
    return merged


def icons(drawings):
    """School point symbols: small filled glyph groups inside a map frame."""
    pts = []
    for x in drawings:
        r = x["rect"]
        if x.get("fill") and x["type"] in ("f", "fs") and 9 < r.width < 26 and 9 < r.height < 26 and abs(r.width - r.height) < 6:
            fr = which_frame(r)
            if fr is None or rc(x["fill"]) == (1.0, 1.0, 1.0):
                continue
            cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
            for p in pts:
                if abs(p["x"] - cx) < 4 and abs(p["y"] - cy) < 4:
                    break
            else:
                pts.append({"x": cx, "y": cy, "frame": fr, "color": rc(x["fill"]), "size": r.width})
    return pts


def main(pdf, out):
    page = pymupdf.open(pdf)[0]
    drawings = page.get_drawings()
    leg = legend(page, drawings)
    clusters, areas = [], []
    for x in drawings:
        fr = which_frame(x["rect"])
        if fr is None:
            continue
        if x.get("fill") and x["type"] in ("f", "fs") and rc(x["fill"]) in leg and len(x["items"]) >= 20:
            clusters.append({"cluster": leg[rc(x["fill"])], "color": rc(x["fill"]), "frame": fr,
                             "rings": path_rings(x["items"])})
        elif x["type"] == "s" and rc(x.get("color")) in LAYER_COLORS and (x.get("width") or 0) >= 2.5:
            rings = path_rings(x["items"])
            if len(rings) > 3:
                rings = chain_dashes(rings, INSET_FRAME if fr == "inset" else MAIN_FRAME)
            areas.append({"layer": LAYER_COLORS[rc(x["color"])], "frame": fr, "rings": rings})
    data = {"legend": {str(k): v for k, v in leg.items()}, "clusters": clusters, "areas": areas,
            "labels": labels(page), "icons": icons(drawings)}
    json.dump(data, open(out, "w"))
    print(pdf.split("/")[-1], "legend", list(leg.values()), "clusters", len(clusters), "areas", len(areas),
          "labels", len(data["labels"]), "icons", len(data["icons"]))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
