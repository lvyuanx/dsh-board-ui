#!/usr/bin/env bash
# Re-render the cover PNG from cover.html (requires Microsoft Edge on macOS).
# Usage: bash cover/render.sh
set -euo pipefail
cd "$(dirname "$0")"
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,1440 \
  --screenshot="$(pwd)/cover.png" \
  "file://$(pwd)/cover.html"
echo "written: $(pwd)/cover.png"
