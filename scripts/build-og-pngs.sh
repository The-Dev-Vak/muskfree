#!/usr/bin/env bash
# Rasterize og/_svg/*.svg -> og/*.png (1200x630).
# macOS: qlmanage renders the 1200x1200 square canvas, sips center-crops the band.
# Linux (CI): rsvg-convert renders directly, then ImageMagick crops.
set -euo pipefail
cd "$(dirname "$0")/.."

if command -v qlmanage >/dev/null 2>&1; then
  qlmanage -t -s 1200 -o og/_svg og/_svg/*.svg >/dev/null 2>&1 || true
  for p in og/_svg/*.svg.png; do
    [ -f "$p" ] || continue
    base=$(basename "$p" .svg.png)
    sips -c 630 1200 "$p" --out "og/$base.png" >/dev/null
    rm "$p"
  done
elif command -v rsvg-convert >/dev/null 2>&1; then
  for s in og/_svg/*.svg; do
    base=$(basename "$s" .svg)
    rsvg-convert -w 1200 -h 1200 "$s" -o "/tmp/$base.full.png"
    convert "/tmp/$base.full.png" -crop 1200x630+0+285 "og/$base.png"
    rm "/tmp/$base.full.png"
  done
else
  echo "No SVG rasterizer found (need qlmanage or rsvg-convert)." >&2
  exit 1
fi
echo "rasterized $(ls og/*.png | wc -l | tr -d ' ') OG cards"
