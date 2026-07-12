# Awesome-list submissions (ready to paste)

The highest-ROI backlink you can get. These lists are scraped and cited by both search and LLMs.

---

## 1. `awesome-react-native` (jondot/awesome-react-native)

**Repo:** https://github.com/jondot/awesome-react-native
**Section:** `## Components` → **UI** (or the closest "Walkthrough / Onboarding / Coachmarks" grouping — search the README for "walkthrough", "onboarding", "intro", "coach"; place it alphabetically next to `react-native-copilot` / `rn-tourguide`).

**Entry (single markdown line — match the list's existing format):**

```markdown
- [react-native-tour-guide](https://github.com/himanshu-lal4/react-native-tour-guide) - Spotlight tours, walkthroughs & coach marks with auto shape-matching, smart auto-scroll and themeable tooltips. Expo & RN CLI, zero native deps, TypeScript, New Architecture ready.
```

> Check `CONTRIBUTING.md` in that repo first — some awesome lists require the entry to be trailing-period-consistent, alphabetized, and to pass `awesome-lint`. Keep the description under ~15 words if they enforce it.

**PR title:**
```
Add react-native-tour-guide (spotlight tours / walkthroughs / coach marks)
```

**PR body:**
```
Adds react-native-tour-guide — a lightweight tour/walkthrough/coach-mark library for React Native.

- Auto shape-matching spotlight (matches each target's border radius: circles, pills, per-corner)
- Smart auto-scroll so the target + tooltip both stay on screen
- Themeable tooltips + createTheme() API, pulse animation, pause/resume, "show once" persistence
- Works with Expo (Go included) and RN CLI — zero native dependencies, only react-native-svg
- TypeScript, New Architecture (Fabric) ready

npm: https://www.npmjs.com/package/@wrack/react-native-tour-guide (~3.3k downloads/mo)
Repo: https://github.com/himanshu-lal4/react-native-tour-guide

Placed alphabetically in the [section] group alongside the other onboarding/walkthrough libraries. Passes awesome-lint.
```

---

## 2. Other lists worth a PR (same entry line, adjust section)

- **`awesome-react-native-ui`** (madhavanmalolan/awesome-reactnative-ui) — UI components.
- **`react-native-community` / directory sites:**
  - **reactnative.directory** — submit at https://github.com/react-native-community/directory (add to `react-native-libraries.json`). This site is what many devs *and* answer engines hit for "react native library for X." High value. Include the npm name, GitHub URL, and topics.
- **`awesome-expo`** (expo-community) if your Expo-Go compatibility is a differentiator (it is — most competitors need a dev build).

---

## reactnative.directory entry (JSON)

Add an object to `react-native-libraries.json` (keep the file's ordering/format):

```json
{
  "githubUrl": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "npmPkg": "@wrack/react-native-tour-guide",
  "examples": [
    "https://github.com/himanshu-lal4/react-native-tour-guide/tree/main/example"
  ],
  "topics": ["tour-guide", "walkthrough", "onboarding", "coachmarks", "spotlight", "expo"]
}
```

> The directory auto-fetches stars, downloads, and platform support from GitHub/npm — you only supply the URL + metadata. Being on reactnative.directory is one of the strongest "is this a real, maintained library" signals for both devs and answer engines.
