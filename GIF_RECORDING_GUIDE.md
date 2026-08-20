# Recording the README demo

The demo is the first thing anyone sees. It has to look like a finished product,
not a test harness.

## What we record

`example/src/DemoShowcase.tsx` — a plausible wallet app that the tour runs over.
It is deliberately **not** the feature harness in `example/src/App.tsx`. Every
step demonstrates a capability *incidentally* (a circular avatar produces a
circular spotlight; the last transaction row starts off-screen so the tour has
to scroll) rather than announcing "here is the circle feature".

Five steps, ~2.6s each on device. That is the whole demo.

## 1. Switch the example app to the demo screen

> The demo self-plays ~2.5s/step. `scripts/make-demo.sh` speeds it up in post.

In `example/index.js`:

```js
const RECORD_DEMO = true;
```

`AUTO_PLAY` is already `true` in `DemoShowcase.tsx`, so the tour self-plays on
launch at a relaxed pace. Recording slowly and speeding up in post gives a crisp
result; recording fast gives a frantic one.

## 2. Record from a standalone build, not Expo Go

Expo Go overlays its own UI on every project — the floating Tools gear, the
dev-menu onboarding sheet, "Open in example?" dialogs — and all of them
photobomb a recording (this is a large part of why the old GIF looked
unprofessional). Build the example as a standalone release app instead; it
contains zero Expo UI:

```bash
cd example
npx expo run:ios --configuration Release --device "iPhone 17 Pro"
```

Then launch it directly (never via an `exp://` deep link, which adds an
"◀ Expo Go" breadcrumb and an open-confirmation dialog):

```bash
xcrun simctl launch booted wrack.reactnativetourguide.example
```

If a stray system dialog is stuck on screen, reboot the simulator
(`xcrun simctl shutdown booted && xcrun simctl boot <udid>`) — synthetic
clicking is unreliable; a reboot is deterministic.

## 3. Record at native resolution

Do **not** downscale while recording. The old demo was captured at 300px wide,
which is soft on every retina display — that alone made it read as amateur.

**iOS simulator**

```bash
xcrun simctl io booted recordVideo --codec h264 --mask ignored ios.mov
```

Use a device with a clean status bar. Set a tidy clock first:

```bash
xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3
```

**Android emulator** — use the emulator's built-in recorder (⋯ → Record screen),
or:

```bash
adb shell screenrecord --bit-rate 8000000 /sdcard/android.mp4 && adb pull /sdcard/android.mp4
```

Record a few seconds of lead-in and tail; you trim in the next step.

## 4. Encode

```bash
scripts/make-demo.sh ios.mov IOSDemo <start> <duration> <speed> <width>

# typical:
scripts/make-demo.sh ios.mov IOSDemo 1.2 14 1.35 540
scripts/make-demo.sh android.mp4 AndroidDemo 1.0 14 1.35 540
```

Each run produces three files:

| File | Used by | Why |
|---|---|---|
| `IOSDemo.gif` | README | GitHub does not play `<video>` in a README |
| `IOSDemo.mp4` | docs site, social cards | ~10× smaller, full colour |
| `IOSDemo.webm` | docs site | smaller still |

Add `FRAME=1` to round the screen corners and drop the recording on a backdrop
so it reads as a device instead of a cropped rectangle:

```bash
FRAME=1 scripts/make-demo.sh ios.mov IOSDemo 1.2 14 1.35 540
```

Tunable via env: `FPS` (30), `RADIUS` (28), `PAD` (28), `BG` (`0x0B0F1A`).

## Why the defaults are what they are

- **540px wide, not 300** — GitHub renders README images up to ~880px. 300px is
  visibly soft on any retina screen.
- **30fps, not 15** — the spotlight morph *is* the product. At 15fps a 400ms
  transition is six frames and reads as a jump cut.
- **~14s, not 22s** — a README GIF should loop before the reader scrolls past.
- **`sierra2_4a` dithering, not `bayer`** — bayer lays a visible cross-hatch over
  flat UI panels, which is a large part of why the old GIF looked cheap.

## Checklist before committing

- [ ] Under 3MB per GIF (the script warns past this).
- [ ] No personal data, real names, or notification banners on screen.
- [ ] Status bar clock is the same in both recordings.
- [ ] The first frame is interesting — GitHub shows it before autoplay starts.
- [ ] iOS and Android are the same length and pacing, so only the platform
      chrome differs.
- [ ] `RECORD_DEMO` set back to `false` in `example/index.js`.
