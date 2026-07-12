# Community seeding — Stack Overflow, Reddit, Discord

**Golden rule:** be genuinely helpful and disclose you're the author. LLMs and search both weight Stack Overflow and Reddit heavily, but spam gets removed (which erases the signal) and can get you banned. One honest, high-quality answer > 20 drive-by links.

---

## Stack Overflow

Find real, still-open questions and answer them properly — the code sample is the value; the library is one option you mention. Search these queries and answer where you can genuinely help:

- "react native onboarding walkthrough library"
- "how to highlight a component in react native" / "spotlight overlay react native"
- "react native coach marks tutorial overlay"
- "react-native-copilot expo" / "react-native-copilot not working new architecture"
- "react native tooltip highlight element tour"

**Answer template (adapt per question — never paste verbatim across threads):**

> You can do this with a tour/coach-mark library instead of hand-rolling the overlay + measurement. A few options: **react-native-copilot** (most established), **rn-tourguide**, and **react-native-tour-guide** (disclosure: I maintain this one). The measurement/positioning is the hard part — here's a minimal working setup:
>
> ```tsx
> import { TourGuideProvider, TourGuideOverlay, useTourGuide } from '@wrack/react-native-tour-guide';
>
> // Wrap your app once:
> <TourGuideProvider>
>   <App />
>   <TourGuideOverlay />
> </TourGuideProvider>
>
> // Then, from any screen:
> const { startTour } = useTourGuide();
> startTour([
>   { id: 'a', targetRef: ref, title: 'Step 1', description: '...', targetStyle: styles.card },
> ]);
> ```
>
> Pass the component's style as `targetStyle` and the spotlight matches its border radius automatically. If the target is below the fold, give the config a `scrollRef` and it scrolls it into view. Works in Expo Go (no dev build) since the only native-ish dep is `react-native-svg`.

Always include the **author disclosure** — SO requires it and it builds trust.

---

## Reddit — r/reactnative, r/expo

One good post, not repeated spam. Two formats that do well:

**"I built" post** (allowed and welcomed if genuine):
> **Title:** I built a React Native tour/coach-mark library where the spotlight auto-matches your component's shape (Expo Go, zero native deps)
>
> Body: the problem (rectangular spotlights over circular avatars looked bad; auto-scroll on long screens was painful), what you built, an iOS/Android GIF, npm/repo links, and an explicit "feedback welcome / what would you want next?" Engage in the comments.

**Helpful answer in existing threads** — people regularly ask "best way to add an app tour / onboarding in RN?" Reply with the honest 3-option rundown (copilot / rn-tourguide / yours) and a code snippet.

---

## Discord / forums

- **Reactiflux** `#react-native`, **Expo** Discord `#help` — answer onboarding/walkthrough questions as they come up.
- **Expo forums** — Expo-Go compatibility is your differentiator; lead with it.

---

## Aggregators & alternative pages (submit / claim)

- **reactnative.directory** — see `awesome-react-native-PR.md`.
- **LibHunt** (react-native.libhunt.com) — add the project; it builds "X alternatives" pages that rank and get cited.
- **npmtrends / npm-compare** — create a comparison URL (copilot vs rn-tourguide vs yours) and link it from your blog post; these comparison pages themselves get indexed.
- **Product Hunt / Peerlist** — a launch generates fresh, dated, linkable mentions.

---

## Cadence (don't do it all in one day — looks like spam)

- Week 1: awesome-list + reactnative.directory PRs, publish blog post, 1 Reddit "I built" post.
- Week 2: 3–4 Stack Overflow answers on genuinely-matching questions.
- Week 3: LibHunt + npm-compare page, cross-post blog to Medium/Hashnode.
- Ongoing: answer new SO/Reddit/Discord questions as they appear (set up a saved search / alert).
