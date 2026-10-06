"""Read the PDF's embedded GeoPDF viewports (/VP /GPTS) into page->projected affines.

Usage: python -I gpts.py <georeferenced pdf> <out georef.json>

All PPS scenario PDFs share one layout, but only some carry the GeoPDF tags (all Status
Quo maps and the A/B 9-12 maps), so one georeferenced PDF serves every map.
The main viewport covers MAIN_FRAME and the second covers the NW inset (INSET_FRAME).
"""
import json
import re
import sys

import numpy as np
from pyproj import Transformer

EPSG = 2913  # NAD83(HARN) / Oregon North (ft), the CRS named in the PDF's WKT
VP = re.compile(rb"/BBox\[([^\]]+)\]/Measure<</Bounds\[[^\]]+\]/GCS<<.*?/GPTS\[([^\]]+)\]/LPTS\[([^\]]+)\]", re.S)


def main(pdf, out):
    raw = open(pdf, "rb").read()
    page_h = float(re.search(rb"/MediaBox\[\s*0 0 [\d.]+ ([\d.]+)\]", raw)[1])
    to_sp = Transformer.from_crs(4326, EPSG, always_xy=True)
    affines = []
    for bb, gp, lp in VP.findall(raw):
        x0, y0, x1, y1 = map(float, bb.split())
        gp, lp = list(map(float, gp.split())), list(map(float, lp.split()))
        # LPTS are unit-square positions inside BBox (PDF y-up); flip to top-down page coords
        src = np.array([[x0 + u * (x1 - x0), page_h - (y0 + v * (y1 - y0))] for u, v in zip(lp[0::2], lp[1::2])])
        dst = np.array([to_sp.transform(lon, lat) for lat, lon in zip(gp[0::2], gp[1::2])])
        A = np.hstack([src, np.ones((len(src), 1))])
        coef, *_ = np.linalg.lstsq(A, dst, rcond=None)
        resid = np.linalg.norm(A @ coef - dst, axis=1).max() * 0.3048
        print(f"viewport page x {src[:, 0].min():.1f}-{src[:, 0].max():.1f} y {src[:, 1].min():.1f}-{src[:, 1].max():.1f}: max corner residual {resid:.1f} m")
        affines.append({"frame": [src[:, 0].min(), src[:, 1].min(), src[:, 0].max(), src[:, 1].max()], "affine": coef.tolist()})
    if len(affines) < 2:
        raise SystemExit("expected main + inset GeoPDF viewports")
    main_vp, inset_vp = sorted(affines, key=lambda a: -(a["frame"][2] - a["frame"][0]))[:2]
    json.dump({"epsg": EPSG, "source": pdf.rsplit("/", 1)[-1], "main": main_vp, "inset": inset_vp}, open(out, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:])
