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
# source file | x y width height (pixels, panel inside the sheet) | output name | [pad to width]
# The optional last field widens a narrow panel to match its partner (see pad-edges.py).
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
Seated cable row.PNG|1 1 762 1023|seated-cable-row-0.jpg
Seated cable row.PNG|773 1 762 1023|seated-cable-row-1.jpg
plank.PNG|1 1 1535 1023|plank-0.jpg
Dumbbell reverse lunge.PNG|1 1 562 1198|reverse-lunge-0.jpg|739
Dumbbell reverse lunge.PNG|573 1 739 1198|reverse-lunge-1.jpg
Goblet Squat Start and Finish.png|1 1 651 1198|goblet-squat-0.jpg
Goblet Squat Start and Finish.png|660 1 651 1198|goblet-squat-1.jpg
Leg Press Form_ Start to Finish.png|1 1 1535 509|leg-press-0.jpg
Leg Press Form_ Start to Finish.png|1 515 1535 509|leg-press-1.jpg
Lat Pulldown Form Guide.png|1 1 651 1198|lat-pulldown-0.jpg
Lat Pulldown Form Guide.png|660 1 651 1198|lat-pulldown-1.jpg
"

mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
echo "$PANELS" | while IFS='|' read -r file rect name pad; do
  [ -z "$file" ] && continue
  read -r x y w h <<<"$rect"
  if [ -n "$pad" ]; then
    sips -s format bmp -c "$h" "$w" --cropOffset "$y" "$x" "$SRC/$file" --out "$TMP/panel.bmp" >/dev/null
    python3 -I "$(dirname "$0")/pad-edges.py" "$TMP/panel.bmp" "$TMP/padded.bmp" "$pad"
    sips -s format jpeg "$TMP/padded.bmp" --out "$OUT/$name" >/dev/null
  else
    sips -s format jpeg -c "$h" "$w" --cropOffset "$y" "$x" "$SRC/$file" --out "$OUT/$name" >/dev/null
  fi
  sips --resampleWidth "$WIDTH" -s formatOptions "$QUALITY" "$OUT/$name" --out "$OUT/$name" >/dev/null
  echo "$name"
done
