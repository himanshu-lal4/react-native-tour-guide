---
layout: home
title: "React Native Tour Guide — App Tours, Walkthroughs & Coach Marks"
description: "Lightweight React Native library for app tours, walkthroughs, onboarding, and coach marks. Auto shape-matching spotlight, smart auto-scroll, themeable tooltips. Expo & RN CLI, zero native deps, TypeScript."
---

# React Native Tour Guide

**The lightweight way to add app tours, walkthroughs, onboarding flows, and coach marks to a React Native app.** The spotlight automatically matches each component's shape — circular avatars get circular spotlights, pill buttons stay pill-shaped, cards keep their exact corner radius — with no manual configuration. Works with **Expo (including Expo Go) and React Native CLI**, ships **zero native dependencies**, is written in **TypeScript**, and is **New Architecture (Fabric) ready**.

```bash
npm install @wrack/react-native-tour-guide react-native-svg
# Expo:
npx expo install @wrack/react-native-tour-guide react-native-svg
```

## Why choose it

- **Auto shape-matching spotlight** — pass your component's style and the cutout matches its border radius (uniform, per-corner, pill, circle).
- **Smart auto-scroll** — scrolls off-screen targets into view, keeping the target *and* tooltip visible, with no flicker.
- **Smart tooltip positioning** — auto-picks the best side and stays within safe-area insets.
- **Runs in Expo Go** — only `react-native-svg` is required; no custom dev build.
- **Fabric-safe overlay** — a real even-odd SVG cutout, so no white film over the highlight on the New Architecture.
- **Themeable** — 4 built-in themes + `createTheme()`, pulse animation, pause/resume, conditional steps, and "show once" persistence.
- **Tiny** — under 50KB.

## Quick links

- [Getting started]({{ '/getting-started/' | relative_url }})
- [How to build a React Native app tour]({{ '/react-native-app-tour/' | relative_url }})
- [React Native walkthrough guide]({{ '/react-native-walkthrough/' | relative_url }})
- [Coach marks & feature discovery]({{ '/react-native-coach-marks/' | relative_url }})
- [User onboarding tutorial]({{ '/react-native-onboarding-tutorial/' | relative_url }})
- [Expo onboarding tour (Expo Go compatible)]({{ '/expo-onboarding-tour/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }})

**Comparisons**

- [react-native-copilot alternative]({{ '/react-native-copilot-alternative/' | relative_url }})
- [rn-tourguide alternative]({{ '/rn-tourguide-alternative/' | relative_url }})

**Install & source**

- 📦 [Install from npm]({{ site.npm_url }}) · ⭐ [Star on GitHub]({{ site.repo_url }})

---

<!-- JSON-LD: helps Google/answer engines parse this as a software project + Q&A. -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "Lightweight React Native library for app tours, walkthroughs, onboarding, and coach marks with an auto shape-matching spotlight, smart auto-scroll, and themeable tooltips. Works with Expo and React Native CLI, zero native dependencies, TypeScript, New Architecture ready.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "react native tour, react native walkthrough, react native onboarding, react native coach marks, react native spotlight, react-native-copilot alternative"
}
</script>
