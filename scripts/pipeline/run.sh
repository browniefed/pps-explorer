#!/bin/bash
# Rebuild public/data/*.geojson from the PPS scenario PDFs.
#   scripts/pipeline/run.sh public/maps
# Setup once: python3 -m venv scripts/pipeline/.venv && scripts/pipeline/.venv/bin/pip install -r scripts/pipeline/requirements.txt
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
PDFS=$(cd "${1:?usage: run.sh <dir with current-/a-/b- PDFs>}" && pwd)
PY="$HERE/.venv/bin/python -I"
OUT="$HERE/../../public/data"
WORK="$HERE/.work"
mkdir -p "$WORK/raw" "$OUT"
for sc in current a b; do
  key=$([ $sc = current ] && echo sq || echo $sc)
  $PY "$HERE/extract.py" "$PDFS/$sc-elementary.pdf" "$WORK/raw/${key}_k5.json"
  $PY "$HERE/extract.py" "$PDFS/$sc-middle.pdf" "$WORK/raw/${key}_68.json"
  $PY "$HERE/extract.py" "$PDFS/$sc-high.pdf" "$WORK/raw/${key}_912.json"
done
# Every map shares one page layout; current-high.pdf carries the GeoPDF viewports.
$PY "$HERE/gpts.py" "$PDFS/current-high.pdf" "$WORK/georef.json"
$PY "$HERE/build.py" "$WORK/raw" "$WORK/georef.json" "$OUT" "$HERE/reference/city_school_boundaries.geojson"
$PY "$HERE/qa.py" "$OUT"
$PY "$HERE/verify_city.py" "$HERE/reference/city_school_boundaries.geojson" "$OUT" | grep "^=="
