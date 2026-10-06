"""Pair school labels with their map icons and derive the school key from a label."""
import re

KEY_SPLIT = re.compile(r"\s(K-5|K-8|K-12|2-8|Middle|High|School|Building|Elementary)\b")


def pair_labels_icons(raw, frame="main"):
    icons = [i for i in raw["icons"] if i["frame"] == frame]
    out = []
    for lab in raw["labels"]:
        x0, y0, x1, y1 = lab["bbox"]
        if not (x0 > 39 and y1 < 3024):
            continue
        best = None
        for i in icons:
            dx = max(x0 - i["x"], 0, i["x"] - x1)
            dy = max(y0 - i["y"], 0, i["y"] - y1)
            d = (dx * dx + dy * dy) ** 0.5
            if best is None or d < best[0]:
                best = (d, i)
        if best and best[0] < 25:
            out.append({"text": lab["text"], "x": best[1]["x"], "y": best[1]["y"]})
    return out


def school_key(text):
    return KEY_SPLIT.split(text)[0].strip()
