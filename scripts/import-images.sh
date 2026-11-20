#!/usr/bin/env bash
# Downloads the exercise photos from free-exercise-db (public domain, Unlicense)
# and shrinks them for phones. Rerun after changing the mapping below.
# Usage: scripts/import-images.sh   (from the repo root; needs curl and macOS sips)
set -euo pipefail

SOURCE="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"
OUT="images"
WIDTH=480
QUALITY=70

# slug  free-exercise-db id  frames (0 1 = animated pair, 1 = still)
MAPPING="
# hip-thrust         Barbell_Hip_Thrust               0 1   (replaced by an AI illustration, see split-illustrations.sh)
# romanian-deadlift  Stiff-Legged_Dumbbell_Deadlift   0 1   (replaced by an AI illustration, see split-illustrations.sh)
# seated-leg-curl    Seated_Leg_Curl                  0 1   (replaced by an AI illustration, see split-illustrations.sh)
# cable-kickback     One-Legged_Cable_Kickback        0 1   (replaced by an AI illustration, see split-illustrations.sh)
# hip-abduction      Thigh_Abductor                   0 1   (replaced by an AI illustration, see split-illustrations.sh)
goblet-squat       Goblet_Squat                     0 1
leg-press          Leg_Press                        0 1
lat-pulldown       Wide-Grip_Lat_Pulldown           0 1
seated-cable-row   Seated_Cable_Rows                0 1
plank              Plank                            1
reverse-lunge      Dumbbell_Rear_Lunge              0 1
back-extension     Hyperextensions_Back_Extensions  0 1
chest-press        Leverage_Chest_Press             0 1
shoulder-press     Dumbbell_Shoulder_Press          0 1
"

mkdir -p "$OUT"
echo "$MAPPING" | while read -r slug id frames; do
  [ -z "$slug" ] && continue
  [[ "$slug" == \#* ]] && continue
  i=0
  for frame in $frames; do
    file="$OUT/$slug-$i.jpg"
    curl -sSfL -o "$file" "$SOURCE/$id/$frame.jpg"
    sips -Z "$WIDTH" -s format jpeg -s formatOptions "$QUALITY" "$file" --out "$file" >/dev/null
    i=$((i + 1))
  done
  echo "$slug: $i image(s)"
done
