#!/usr/bin/env bash
# Cuts the AI-generated illustration sheets (several panels per file) into one
# image per exercise position, then shrinks them for phones.
# Usage: scripts/split-illustrations.sh <source-folder> <output-folder>
set -euo pipefail

SRC="${1:-$HOME/Pictures/gym-illustrations}"
OUT="${2:-images}"
WIDTH=600
QUALITY=72

# Offsets start at 1, not 0: sips ignores a 0 offset and centres the crop.
# source file | x y width height (pixels, panel inside the sheet) | output name
PANELS="
Barbell Hip Thrust_ Start to Finish.png|1 1 881 886|hip-thrust-0.jpg
Barbell Hip Thrust_ Start to Finish.png|892 1 881 886|hip-thrust-1.jpg
Romanian Deadlift_ Start and End.png|1 1 762 1023|romanian-deadlift-0.jpg
Romanian Deadlift_ Start and End.png|773 1 762 1023|romanian-deadlift-1.jpg
Seated Leg Curl and Glute Kickback Guide.png|1 1 763 508|seated-leg-curl-0.jpg
Seated Leg Curl and Glute Kickback Guide.png|772 1 763 508|seated-leg-curl-1.jpg
Seated Leg Curl and Glute Kickback Guide.png|1 515 763 508|cable-kickback-0.jpg
Seated Leg Curl and Glute Kickback Guide.png|772 515 763 508|cable-kickback-1.jpg
Hip Abduction Machine.png|1 1 881 886|hip-abduction-0.jpg
Hip Abduction Machine.png|892 1 881 886|hip-abduction-1.jpg
"

mkdir -p "$OUT"
echo "$PANELS" | while IFS='|' read -r file rect name; do
  [ -z "$file" ] && continue
  read -r x y w h <<<"$rect"
  sips -s format jpeg -c "$h" "$w" --cropOffset "$y" "$x" "$SRC/$file" --out "$OUT/$name" >/dev/null
  sips --resampleWidth "$WIDTH" -s formatOptions "$QUALITY" "$OUT/$name" --out "$OUT/$name" >/dev/null
  echo "$name"
done
