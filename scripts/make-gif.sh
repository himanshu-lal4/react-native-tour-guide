#!/usr/bin/env bash
#
# make-gif.sh — turn a simulator/emulator screen recording (or an existing GIF)
# into an optimized, fast demo GIF for the README.
#
# Requires: ffmpeg  (brew install ffmpeg)
#
# Usage:
#   scripts/make-gif.sh <input> <output.gif> [start] [duration] [speed] [fps] [width]
#
#   input     .mov / .mp4 / .gif  source recording
#   output    destination .gif
#   start     seconds to trim from the start   (default 0)   — skip dead air before the tour
#   duration  seconds to keep after <start>     (default: to end)
#   speed     playback multiplier               (default 2.0) — 2.0 = twice as fast
#   fps       output frame rate                 (default 15)
#   width     output width in px (height auto)  (default 320)
#
# Examples:
#   # iOS recording: drop first 1.5s, keep 40s, play 2x, 320px wide
#   scripts/make-gif.sh ios.mov IOSDemo.gif 1.5 40 2 15 320
#   # Android recording
#   scripts/make-gif.sh android.mp4 AndroidDemo.gif 1 40 2 15 320
#
set -euo pipefail

IN="${1:?input file required}"
OUT="${2:?output .gif required}"
START="${3:-0}"
DURATION="${4:-}"
SPEED="${5:-2.0}"
FPS="${6:-15}"
WIDTH="${7:-320}"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT
PALETTE="$TMPDIR/palette.png"

DUR_ARG=()
[ -n "$DURATION" ] && DUR_ARG=(-t "$DURATION")
# Safe expansion even when the array is empty (macOS bash 3.2 + set -u).
safe_dur=(${DUR_ARG[@]+"${DUR_ARG[@]}"})

# setpts=PTS/SPEED speeds the clip up; fps + scale keep the GIF small and crisp.
FILTER="setpts=PTS/${SPEED},fps=${FPS},scale=${WIDTH}:-1:flags=lanczos"

echo "→ generating palette…"
ffmpeg -loglevel error -ss "$START" ${safe_dur[@]+"${safe_dur[@]}"} -i "$IN" \
  -vf "${FILTER},palettegen=stats_mode=diff" -y "$PALETTE"

echo "→ encoding GIF…"
ffmpeg -loglevel error -ss "$START" ${safe_dur[@]+"${safe_dur[@]}"} -i "$IN" -i "$PALETTE" \
  -lavfi "${FILTER}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  -y "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "✓ wrote $OUT (${SIZE})"
