# Getting `@wrack/react-native-tour-guide` recommended by LLMs

A prioritized, honest plan for **SEO** (rank in search), **AEO** (Answer Engine Optimization — Perplexity, ChatGPT-search, Google AI Overviews), and **GEO** (Generative Engine Optimization — get cited in generated answers and picked up by future model training).

## The one thing to understand first

There are **two different machines** you're optimizing for, and they have different timelines:

| Machine | Examples | How it picks libraries | How fast you can influence it |
|---|---|---|---|
| **Answer engines (RAG / grounded)** | Perplexity, ChatGPT with search, Google AI Overviews, Gemini grounding, Bing Copilot | Runs a live web search at query time, summarizes top results | **Weeks–months** — this is where you get fast wins |
| **Parametric memory** | ChatGPT/Claude/Gemini answering *without* browsing | Recalls what it saw thousands of times during training | **6–18 months** — driven by real web footprint before the training cutoff; you can't inject it |

**You cannot "trick" either one.** Both reward the same thing: your library being **genuinely mentioned and linked across the web** in the context of "React Native tour / walkthrough / onboarding." Everything below is about manufacturing legitimate, high-quality mentions and making them easy to extract.

Your current state (July 2026): 3.3k downloads/mo (real usage), 8 stars, **zero web mentions**, no docs site. On-page content is already excellent. The bottleneck is 100% off-page.

---

## Priority 1 — Off-page mentions (this is 80% of the result)

LLMs recommend what the web co-mentions with the query. Ranked by ROI:

- [ ] **Awesome lists.** Submit to `awesome-react-native` (and `awesome-react-native-ui`). These are scraped, mirrored, and cited constantly — the single highest-leverage backlink you can get. → ready-to-submit entry in `awesome-react-native-PR.md`.
- [ ] **A comparison listicle.** Publish "Best React Native tour / onboarding libraries in 2026" on **dev.to**, then cross-post to **Medium**, **Hashnode**, and your own blog (canonical). Answer engines synthesize "best X" queries *directly* from articles titled "best X." → full draft in `blog-comparison-post.md`.
- [ ] **Stack Overflow.** Answer existing questions where your lib genuinely fits ("how to add a walkthrough/coach mark/onboarding tour in React Native"). SO is extremely heavily weighted by both search and LLMs. → target questions + honest answer templates in `community-seeds.md`.
- [ ] **Reddit r/reactnative & r/expo**, plus the Reactiflux/Expo Discords. One good "I built this / here's how I solved onboarding" post.
- [ ] **Comparison/alternative pages.** Get listed on npm-compare, LibHunt, openbase-style aggregators, and "alternatives to react-native-copilot" style pages.

**Rule:** never spam. One genuinely useful post in the right place beats 50 low-effort mentions and won't get you banned (which backfires). Quality and relevance are what both humans and rankers reward.

---

## Priority 2 — A docs site (new rankable surfaces)

A single README ranks for a handful of queries. A docs site with **one page per query** ranks for dozens and gives answer engines clean, extractable pages to cite. → scaffolded in `../docs/` (GitHub Pages / Jekyll, zero build step).

- [ ] Enable GitHub Pages: repo **Settings → Pages → Source: Deploy from branch → `main` / `/docs`**.
- [ ] Set the repo **homepage URL** to the Pages URL (currently points to npm).
- [ ] Add pages targeting exact queries: "react native app tour", "react native walkthrough", "react native coach marks", "react native onboarding tutorial", "react-native-copilot alternative".
- [ ] Once live, add the docs URL to `package.json` `homepage` and the README header.

---

## Priority 3 — On-page SEO polish (mostly done)

- [x] Question-based headers + FAQ block in README (great for AEO extraction).
- [x] Explicit competitor comparison table + "How does it compare to react-native-copilot / rn-tourguide?".
- [x] `llms.txt` shipped in the package.
- [x] Comprehensive npm keywords + GitHub topics.
- [ ] Add a JSON-LD `FAQPage` + `SoftwareApplication` block to the docs site (helps Google parse Q&A → AI Overviews). → included in docs.
- [ ] Add `SoftwareSourceCode`/`SoftwareApplication` schema so the package is machine-readable as software.

---

## Priority 4 — Social proof signals (slow compounding)

- [ ] **GitHub stars.** From 8 → the first few hundred is where crawlers/rankers start treating you as a "real" option. Ask in your blog post, README, and Reddit posts. Add a star CTA to the docs site.
- [ ] Keep **npm downloads** trending up (already healthy) — visible on npm and weighted by aggregators.
- [ ] Add a short **demo video** (Loom/YouTube) — video results get surfaced and transcripts get indexed.

---

## Honest timeline

- **Week 0–2:** awesome-list PR merged, blog post published + cross-posted, docs site live, 3–5 SO answers, one Reddit post.
- **Month 1–3:** you start appearing in **Perplexity / ChatGPT-search / AI Overviews** for long-tail queries ("react-native-copilot alternative", "expo go compatible tour library") because you now rank and are linked from awesome-list + your article.
- **Month 6–18:** as these mentions accumulate and get re-crawled, you begin surfacing in **from-memory** answers from newly trained models. This is the payoff for the seeding you do now.

There is no shortcut past the training-lag for parametric recall. But the answer-engine wins are real and reachable within weeks — and those are what most people actually use today when they ask "suggest the best library."

---

## Measurement

- Track weekly: GitHub stars, npm downloads, referral traffic to the docs site (GitHub Pages + Plausible/GA).
- Every ~2 weeks, actually *ask the answer engines*: "best react native app tour library", "react-native-copilot alternative", "expo compatible walkthrough library". Note whether/where you appear. That's your ground-truth KPI.
