# Newsletter & aggregator outreach kit

Covers two libraries by Himanshu Lal (`himanshu-lal4`):

1. **`@wrack/react-native-tour-guide`** — spotlight app tours, walkthroughs, coach marks. Auto shape-matching spotlight, smart auto-scroll, zero native deps, runs in Expo Go.
   - npm: https://www.npmjs.com/package/@wrack/react-native-tour-guide
   - docs: https://himanshu-lal4.github.io/react-native-tour-guide/
2. **`react-native-liquid-glassmorphism`** — authentic Liquid Glass on **both** iOS (native `UIGlassEffect`, iOS 26) and Android (real-time AGSL refraction shader).
   - npm: https://www.npmjs.com/package/react-native-liquid-glassmorphism
   - docs: https://himanshu-lal4.github.io/react-native-liquid-glassmorphism/

**Golden rules for every submission below:** one submission per outlet, disclose you're the author, don't nag. Curated newsletters often quote your blurb near-verbatim, so send them a clean, honest one-liner — not a press release.

> ⚠️ **Verify before sending.** Submission URLs and forms change often. Rows flagged *"verify on site"* below are ones I could not confirm as a current, public submission mechanism at the time of writing — open the outlet's site and find the live "suggest a link" / contact path before you send. Never invent a submission email.

---

## 1. Target table

| Outlet | URL | How to submit | Audience (rough) | Best fit |
|---|---|---|---|---|
| **React Native Newsletter** (Infinite Red) | reactnative.cc — also reactnativenewsletter.com | **Public submit form:** https://reactnativenewsletter.com/submit (email + link + summary fields). Contact / sponsorship: `newsletters@infinite.red`. *Confirmed.* | RN devs, bi-weekly | **Both** — the single best home for both libs |
| **This Week In React** (Sébastien Lorber) | https://thisweekinreact.com | No public "submit" form I could confirm — Sébastien curates from the web and X. Best route: **mention on X and tag `@sebastienlorber` / `@thisweekinreact`**, or use the contact path on the site. *Verify on site.* | 45k+ React / RN devs, weekly | **Both** — strong fit, esp. liquid-glass |
| **React Status** (Cooperpress) | https://react.statuscode.com | Cooperpress issues carry a **"Suggest a link"** path in the issue footer / site. *Verify current form on site.* | React + RN devs, weekly | **Both** |
| **JavaScript Weekly** (Cooperpress) | https://javascriptweekly.com | Same Cooperpress **"suggest a link"** mechanism (issue footer / site). *Verify current form on site.* | Broad JS, very large, weekly | Liquid-glass (visual novelty travels widest); tour-guide secondary |
| **Mobile Dev Weekly** (Cooperpress) | https://mobiledevweekly.com | Same Cooperpress **"suggest a link"** mechanism. *Verify current form on site.* | Cross-platform mobile devs, weekly | **Both** |
| **Frontend Focus** (Cooperpress) | https://frontendfoc.us | Same Cooperpress **"suggest a link"** mechanism. *Verify current form on site.* | Frontend / CSS / UI devs, weekly | Liquid-glass (UI/visual angle) |
| **Node Weekly** (Cooperpress) | https://nodeweekly.com | Same Cooperpress **"suggest a link"** mechanism. *Verify current form on site.* | Node.js / backend devs, weekly | **Weak fit** — both are RN *UI* libs, not Node tooling. Skip unless you have a Node-adjacent angle (e.g. build/CLI). Low priority. |
| **Bytes** (ui.dev / Tyler McGinnis) | https://bytes.dev | Editorial, no public submission form I could confirm. Route: **reply to a Bytes issue** (their emails are reply-friendly) or use contact on bytes.dev. *Verify on site.* | Very large JS audience, twice weekly, humorous tone | Liquid-glass (eye-catching, demoable) |
| **Pointer.io** | https://www.pointer.io | Hand-curated for eng leaders; no obvious public submission — contact via the site. *Verify on site; treat as low-probability.* | Senior devs / eng leaders, weekly | Liquid-glass (deep-dive "how it works" appeal) |
| **React Native Radio** (Infinite Red podcast) | https://reactnativeradio.com | Not a newsletter — pitch a **topic/guest** via the site's suggestion path or X `@ReactNativeRadio`. *Verify on site.* | RN devs (podcast) | **Both** — pitch as an episode topic, not a blurb |
| **reactnative.directory** (aggregator, not a newsletter) | https://reactnative.directory | Auto-indexes npm packages with correct `package.json` metadata; add/curate via **PR to the repo**. See `awesome-react-native-PR.md`. *Mechanism confirmed; exact repo steps in that file.* | RN devs browsing for libs | **Both** |

**Submission methods I was NOT confident about (verify these):** This Week In React, React Status, JavaScript Weekly, Mobile Dev Weekly, Frontend Focus, Node Weekly (all the Cooperpress "suggest a link" forms — I could not confirm the exact live form URL), Bytes, Pointer.io, and React Native Radio. The only one I fully confirmed is **React Native Newsletter's** `reactnativenewsletter.com/submit` form.

---

## 2. Pitch blurbs

### 2a. Short one-liners (~40 words — newsletters often quote these near-verbatim)

**Tour Guide:**
> `@wrack/react-native-tour-guide` adds spotlight tours and coach marks to React Native. The spotlight auto-matches each target's shape — circles stay circular, pills stay pill-shaped — and auto-scrolls off-screen steps into view. Zero native deps; runs in Expo Go.

**Liquid Glass** (leads with the Android hook):
> `react-native-liquid-glassmorphism` brings real Liquid Glass to **Android**, not just iOS — a per-frame AGSL shader that actually *refracts* the backdrop (edge lensing, chromatic dispersion, Fresnel rim), plus native `UIGlassEffect` on iOS 26. One declarative component, custom shapes.

### 2b. Longer pitch emails (~120 words — for outlets that take email / reply)

**Tour Guide**

**Subject:** A React Native tour library where the spotlight auto-matches each component's shape

> Hi [name],
>
> I maintain `@wrack/react-native-tour-guide`, an open-source library for app tours, walkthroughs, and coach marks in React Native. Disclosure up front: I'm the author.
>
> The differentiator is shape matching — the spotlight reads each target's border radius and matches it automatically. Circular avatars get a circle, pills get a pill, cards keep their exact per-corner radii, so you never hand-configure shapes. It also auto-scrolls off-screen steps into view (target *and* tooltip stay visible), ships zero native dependencies beyond `react-native-svg`, and runs in Expo Go without a dev build. New Architecture ready, fully typed.
>
> Might suit readers building onboarding flows.
>
> npm: https://www.npmjs.com/package/@wrack/react-native-tour-guide
> Docs: https://himanshu-lal4.github.io/react-native-tour-guide/
>
> Thanks for considering,
> Himanshu Lal

**Liquid Glass**

**Subject:** Liquid Glass on Android too — a real AGSL refraction shader, not just iOS

> Hi [name],
>
> I maintain `react-native-liquid-glassmorphism`, an open-source library that brings Apple's Liquid Glass look to React Native. Disclosure: I'm the author.
>
> The rare part is Android. Apple's Liquid Glass is iOS-only at the system level, so most "glass" libraries either just blur or are iOS-only. This one reproduces the actual optics on Android with a per-frame AGSL shader: it captures the backdrop and refracts it — edge lensing, chromatic dispersion, a mirrored edge reflection, a Fresnel rim — with interactive touch/tilt response and custom (even concave SVG) shapes. On iOS 26 it renders the native `UIGlassEffect`, with graceful fallbacks below.
>
> One declarative component, same API on both platforms. There's a side-by-side demo reel in the docs.
>
> npm: https://www.npmjs.com/package/react-native-liquid-glassmorphism
> Docs: https://himanshu-lal4.github.io/react-native-liquid-glassmorphism/
>
> Thanks,
> Himanshu Lal

**Tip:** where a form has a "summary" field rather than an email body, paste the matching **short one-liner** from 2a, not the full email.

---

## 3. Submission cadence & etiquette

**Don't blast all outlets in one day** — staggering looks intentional, and it lets you use what lands (a mention in one newsletter becomes a credible line in the next pitch).

**Lead with the strongest fits.** In order:

- **Week 1 — the RN-native homes.** Submit **liquid-glass** to *React Native Newsletter* (confirmed form) and post/tag it at *This Week In React*. These two are the highest-fit, highest-conversion outlets, and liquid-glass is the more novel of the two libs — lead with it. Submit **tour-guide** to *React Native Newsletter* the same week (different item, same outlet is fine).
- **Week 2 — the Cooperpress network.** Suggest-a-link **liquid-glass** to *React Status* and *JavaScript Weekly*; **both libs** to *Mobile Dev Weekly*; **liquid-glass** to *Frontend Focus*. One link each, spread across a couple of days.
- **Week 3 — broader / lower-probability.** *Bytes* (reply to an issue) and *Pointer.io* — liquid-glass, since visual novelty is what earns a slot there. Pitch *React Native Radio* as an episode topic (how the Android shader works is a genuinely good segment).
- **Ongoing.** Keep `reactnative.directory` metadata correct (see `awesome-react-native-PR.md`); re-submit only when there's a **real new milestone** (major version, web support, a notably better demo) — never the same item twice.

**Etiquette (non-negotiable):**

- **One submission per outlet per item.** If it's not picked up, that's the answer — don't re-send or follow up asking why.
- **Disclose you're the author** every time. These curators know the space; honesty is why they'll trust you next time.
- **No hype-speak.** "Refracts the backdrop with an AGSL shader" is concrete and interesting; "revolutionary game-changing glass" gets deleted.
- **Give them a working demo link**, not just claims — the docs sites have the GIF reels, which is often what earns the slot.
- **Skip poor fits** (e.g. Node Weekly) rather than forcing a pitch — a bad submission spends goodwill you'll want later.
