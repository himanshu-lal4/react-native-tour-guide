# react-native-tour-guide

Published to **two registries** — keep them in sync:

| Registry | Package name | How it publishes |
| --- | --- | --- |
| npm (primary) | `@wrack/react-native-tour-guide` | `.github/workflows/publish-npm.yml` |
| GitHub Packages (mirror) | `@himanshu-lal4/react-native-tour-guide` | `.github/workflows/publish-github-packages.yml` |

## Release checklist — IMPORTANT

After any version bump / npm publish, the GitHub Packages mirror must be updated too:

- The workflow runs **automatically** when a GitHub Release is published. Prefer creating a GitHub Release for each version (`gh release create vX.Y.Z`).
- If no release was created, trigger it manually: `gh workflow run publish-github-packages.yml -R himanshu-lal4/react-native-tour-guide`
- **Always remind the user about the GitHub Packages mirror when helping with a release.** Verify afterwards that the new version appears under the repo's Packages section.

The package name in `package.json` must stay `@wrack/react-native-tour-guide` — the workflow rewrites the scope at publish time only (GitHub Packages requires the repo-owner scope).

The README's "Installing from GitHub Packages" section documents the mirror for users; keep it accurate if install steps or exports change.
