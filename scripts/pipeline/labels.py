"""Pair school labels with their map icons and derive the school key from a label."""
import math
import re

KEY_SPLIT = re.compile(r"\s(K-5|K-8|K-12|2-8|Middle|High|School|Building|Elementary)\b")


def _gap(lab, i):
    x0, y0, x1, y1 = lab["bbox"]
    return math.hypot(max(x0 - i["x"], 0, i["x"] - x1), max(y0 - i["y"], 0, i["y"] - y1))


def pair_labels_icons(raw, frame="main", max_gap=25):
    """Give each label its own icon. Nearest-icon alone fails where labels crowd: Richmond's long
    label ends 6 pt from Atkinson's dot, closer than its own dot 13 pt to its left. So labels that
    compete for icons are solved together, choosing the pairing with the smallest total gap."""
    icons = [i for i in raw["icons"] if i["frame"] == frame]
    labels = [l for l in raw["labels"] if l["bbox"][0] > 39 and l["bbox"][3] < 3024]
    cand = [[(d, k) for k, i in enumerate(icons) if (d := _gap(lab, i)) < max_gap] for lab in labels]
    # labels linked through shared candidate icons form small groups; solve each group exactly
    seen, out = set(), []
    for start in range(len(labels)):
        if start in seen or not cand[start]:
            continue
        group, todo = [], [start]
        while todo:
            a = todo.pop()
            if a in seen:
                continue
            seen.add(a)
            group.append(a)
            ks = {k for _, k in cand[a]}
            todo += [b for b in range(len(labels)) if b not in seen and ks & {k for _, k in cand[b]}]
        for a, k in _assign(group, cand).items():
            out.append({"text": labels[a]["text"], "x": icons[k]["x"], "y": icons[k]["y"]})
    return out


def _assign(group, cand):
    """Min total gap, one icon per label; a label left without an icon costs more than any gap."""
    best = (math.inf, {})
    def go(i, used, cost, picks):
        nonlocal best
        if cost >= best[0]:
            return
        if i == len(group):
            best = (cost, dict(picks))
            return
        a = group[i]
        for d, k in sorted(cand[a]):
            if k not in used:
                picks[a] = k
                go(i + 1, used | {k}, cost + d, picks)
                del picks[a]
        go(i + 1, used, cost + 1000, picks)
    go(0, frozenset(), 0, {})
    return best[1]


def school_key(text):
    return KEY_SPLIT.split(text)[0].strip()
