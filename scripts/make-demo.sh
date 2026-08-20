#!/usr/bin/env bash
#
# make-demo.sh — turn a raw simulator/emulator screen recording into the
# README demo assets.
#
# Produces, from one recording:
#   <name>.gif   optimized, retina-ish, 30fps  (README — GitHub does not play video)
#   <name>.mp4   h264, for the docs site / social cards
#   <name>.webm  vp9, smaller, for the docs site
#
# Why the defaults are what they are:
#   * width 540  — the old 300px demo was soft on every retina display. GitHub
#                  renders README images at ~880px max, so 540 stays crisp
#                  without doubling the file size.
#   * fps 30     — the spotlight morph is the product. At 15fps a 400ms
#                  transition is 6 frames and reads as a jump cut, which is
#                  exactly what made the old GIF feel cheap.
#   * sierra2_4a — error-diffusion dithering. The old bayer dither laid a visible
#                  cross-hatch over flat UI panels.
#   * corners    — rounds the screen corners and drops it on a soft backdrop so
#                  the recording reads as a device, not a cropped rectangle.
#
# Requires: ffmpeg  (brew install ffmpeg)
#
# Usage:
#   scripts/make-demo.sh <input> <name> [start] [duration] [speed] [width]
#
# Example:
#   scripts/make-demo.sh ~/Desktop/ios.mov IOSDemo 1.2 14 1.35 540
#
set -euo pipefail

IN="${1:?input recording required (.mov/.mp4)}"
NAME="${2:?output base name required, e.g. IOSDemo}"
START="${3:-0}"
DURATION="${4:-}"
SPEED="${5:-1.35}"
WIDTH="${6:-540}"
FPS="${FPS:-30}"
RADIUS="${RADIUS:-28}"
PAD="${PAD:-28}"
BG="${BG:-0x0B0F1A}"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found — brew install ffmpeg"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

DUR=()
[ -n "$DURATION" ] && DUR=(-t "$DURATION")
dur=(${DUR[@]+"${DUR[@]}"})

# 1. speed + frame rate + scale to an even width (h264 requires even dimensions)
BASE="setpts=PTS/${SPEED},fps=${FPS},scale=${WIDTH}:-2:flags=lanczos"

# 2. Optional device framing: FRAME=1 rounds the screen corners and drops it on
#    an opaque backdrop so the recording reads as a device rather than a cropped
#    rectangle. Off by default — a transparent GIF needs a far larger palette and
#    balloons the file (a 3s clip went from ~600KB to 22MB in testing), and a
#    transparent background renders inconsistently across GitHub themes.
if [ "${FRAME:-0}" = "1" ]; then
  ROUND="format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(abs(W/2-X),W/2-${RADIUS})*gt(abs(H/2-Y),H/2-${RADIUS}), if(lte(hypot(${RADIUS}-(W/2-abs(W/2-X)),${RADIUS}-(H/2-abs(H/2-Y))),${RADIUS}),255,0), 255)'"
  FILTER="${BASE},${ROUND},pad=iw+${PAD}*2:ih+${PAD}*2:${PAD}:${PAD}:color=${BG},format=rgb24"
else
  FILTER="${BASE}"
fi

echo "→ ${NAME}: ${WIDTH}px · ${FPS}fps · ${SPEED}x · frame=${FRAME:-0}"

echo "  · palette"
ffmpeg -loglevel error -ss "$START" ${dur[@]+"${dur[@]}"} -i "$IN" \
  -vf "${FILTER},palettegen=stats_mode=diff:max_colors=192" -y "$TMP/pal.png"

echo "  · gif"
ffmpeg -loglevel error -ss "$START" ${dur[@]+"${dur[@]}"} -i "$IN" -i "$TMP/pal.png" \
  -lavfi "${FILTER}[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle" \
  -loop 0 -y "${NAME}.gif"

echo "  · mp4"
ffmpeg -loglevel error -ss "$START" ${dur[@]+"${dur[@]}"} -i "$IN" \
  -vf "${BASE},format=yuv420p" -an -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart \
  -y "${NAME}.mp4"

echo "  · webm"
ffmpeg -loglevel error -ss "$START" ${dur[@]+"${dur[@]}"} -i "$IN" \
  -vf "${BASE},format=yuv420p" -an -c:v libvpx-vp9 -pix_fmt yuv420p -crf 34 -b:v 0 -row-mt 1 \
  -y "${NAME}.webm"

for f in "${NAME}.gif" "${NAME}.mp4" "${NAME}.webm"; do
  [ -f "$f" ] && printf '  ✓ %-16s %s\n' "$f" "$(du -h "$f" | cut -f1)"
done

GIF_BYTES=$(wc -c < "${NAME}.gif")
if [ "$GIF_BYTES" -gt 3000000 ]; then
  echo "  ! ${NAME}.gif is over 3MB — shorten with <duration> or raise <speed>."
fi
