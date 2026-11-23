#!/usr/bin/env bash
# Renders icons/icon.svg into the PNG icons the app needs (home screen, Android,
# favicon). macOS sips cannot draw SVG filters (the glow), so headless Firefox
# draws it at 512 px and sips shrinks that for the other sizes.
# Usage: scripts/render-icons.sh   (from the repo root; needs Firefox and python3)
set -euo pipefail

FIREFOX="${FIREFOX:-/Applications/Firefox.app/Contents/MacOS/firefox}"
PORT=8767
TMP="$(mktemp -d)"
trap 'kill "$SERVER" 2>/dev/null; wait "$SERVER" 2>/dev/null || true; rm -rf "$TMP"' EXIT

cp icons/icon.svg "$TMP/icon.svg"
cat >"$TMP/index.html" <<'HTML'
<!doctype html><html><head><style>html,body{margin:0;overflow:hidden}img{display:block;width:512px;height:512px}</style></head>
<body><img src="icon.svg"></body></html>
HTML
python3 -m http.server "$PORT" --directory "$TMP" >/dev/null 2>&1 &
SERVER=$!
sleep 1

"$FIREFOX" --headless --profile "$TMP/profile" --window-size=512,512 \
  --screenshot "$TMP/icon-512.png" "http://localhost:$PORT/index.html" >/dev/null 2>&1

# A round trip through JPEG drops the alpha channel: iOS wants opaque icons.
sips -s format jpeg -s formatOptions 100 "$TMP/icon-512.png" --out "$TMP/opaque.jpg" >/dev/null
for size in 512 192 180 32; do
  name="icon-$size.png"
  [ "$size" = 180 ] && name="apple-touch-icon.png"
  [ "$size" = 32 ] && name="favicon-32.png"
  sips -s format png -z "$size" "$size" "$TMP/opaque.jpg" --out "icons/$name" >/dev/null
  echo "icons/$name"
done
