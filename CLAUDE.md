# react-native-tour-guide

Published to **two registries** — keep them in sync:

| Registry | Package name | How it publishes |
| --- | --- | --- |
| npm (primary) | `@wrack/react-native-tour-guide` | `.github/workflows/publish-npm.yml` |
| GitHub Packages (mirror) | `@himanshu-lal4/react-native-tour-guide` | `.github/workflows/publish-github-packages.yml` |
| npm (alias) | `react-native-tour-guide` | `.github/workflows/publish-npm.yml` (job `publish-alias`) |

## Release checklist — IMPORTANT

After any version bump / npm publish, the GitHub Packages mirror must be updated too:

- The workflow runs **automatically** when a GitHub Release is published. Prefer creating a GitHub Release for each version (`gh release create vX.Y.Z`).
- If no release was created, trigger it manually: `gh workflow run publish-github-packages.yml -R himanshu-lal4/react-native-tour-guide`
- **Always remind the user about the GitHub Packages mirror when helping with a release.** Verify afterwards that the new version appears under the repo's Packages section.

### The `alias/` package

`alias/` is a separate npm package published as the unscoped name
`react-native-tour-guide`. It contains no implementation — it depends on
`@wrack/react-native-tour-guide` and re-exports it, so both import specifiers
resolve to the same code. It exists because the repo, the docs URL and every
external link spell the name unscoped, so that is the name a reader (or a coding
agent) guesses; without it, `npm install react-native-tour-guide` 404s.

On every release, bump `alias/package.json` `version` **and** its
`dependencies["@wrack/react-native-tour-guide"]` to the new version. Publishing
itself is handled by `publish-npm.yml`, which refuses to publish the alias if
either value has drifted from the canonical package — a drifted alias would
silently serve an older library to anyone using the unscoped name.

**Bootstrap caveat.** npm cannot configure a trusted publisher for a package
that does not exist, so `react-native-tour-guide` must be published by hand
**once** before the workflow can take it over:

```sh
cd alias && npm publish --access public --otp=<code-from-authenticator>
```

Then on npmjs.com, for **each** of the two packages, set Settings → Trusted
Publisher to GitHub Actions / `himanshu-lal4/react-native-tour-guide` /
`publish-npm.yml`, environment blank. After that no npm token is ever needed
and both packages publish with provenance.

Canonical stays `@wrack/react-native-tour-guide`. The alias is never the source
of truth and never contains code.

The package name in `package.json` must stay `@wrack/react-native-tour-guide` — the workflow rewrites the scope at publish time only (GitHub Packages requires the repo-owner scope).

The README's "Installing from GitHub Packages" section documents the mirror for users; keep it accurate if install steps or exports change.
