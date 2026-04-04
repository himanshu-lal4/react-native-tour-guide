# Contributing

Contributions are always welcome, no matter how large or small!

Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for version)
- Yarn 3.6+ (this project uses Yarn workspaces)

### Setup

```sh
# Clone the repo
git clone https://github.com/himanshu-lal4/react-native-tour-guide.git
cd react-native-tour-guide

# Install dependencies (this also sets up husky hooks)
yarn
```

### Project Structure

```
├── src/                  # Library source code
│   ├── __tests__/        # Test files
│   ├── types.ts          # TypeScript interfaces
│   ├── TourGuideContext.tsx
│   ├── TourGuideOverlay.tsx
│   ├── SpotlightOverlay.tsx
│   ├── Tooltip.tsx
│   ├── accessibility.ts
│   ├── useTourPersistence.ts
│   ├── utils.ts
│   └── index.tsx         # Public API exports
├── example/              # Example app (Expo)
├── lib/                  # Built output (don't edit)
├── .husky/               # Git hooks
└── .github/              # GitHub workflows & templates
```

## Development Workflow

### Running the Example App

```sh
yarn example start        # Start Metro bundler
yarn example ios          # Run on iOS
yarn example android      # Run on Android
yarn example web          # Run on Web
```

The example app uses the local library source, so changes are reflected immediately (JS changes — native changes need a rebuild).

### Useful Commands

| Command | Description |
|---------|-------------|
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with auto-fix |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn test` | Run Jest tests |
| `yarn build` | Build the library |
| `yarn format` | Format code with Prettier |
| `yarn validate` | Run all checks (lint + typecheck + test + build) |

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) for git hooks:

### Pre-commit
- Checks for merge conflict markers
- Scans for accidental secrets/credentials
- Blocks files larger than 1MB
- Runs ESLint on staged files
- Runs TypeScript type checking

### Commit Message
- Validates [Conventional Commits](https://www.conventionalcommits.org/) format
- Shows helpful error with allowed types if validation fails

### Pre-push
- Validates branch naming convention (see below)

## Branch Naming

All branches must follow this naming convention:

| Prefix | Use for | Example |
|--------|---------|---------|
| `feature/` | New feature | `feature/add-tooltip-animation` |
| `fix/` | Bug fix | `fix/android-overlay-crash` |
| `docs/` | Documentation | `docs/update-api-reference` |
| `refactor/` | Code restructuring | `refactor/extract-scroll-hook` |
| `chore/` | Tooling, CI, deps | `chore/upgrade-eslint` |
| `perf/` | Performance | `perf/reduce-re-renders` |
| `test/` | Tests | `test/add-tooltip-tests` |

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <subject>
```

**Allowed types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `chore` | Build, CI, tooling changes |
| `ci` | CI/CD changes |
| `revert` | Revert a previous commit |

**Examples:**
```
feat: add tour persistence hook
fix: correct tooltip positioning on small screens
docs: update API reference for v1.0
chore: upgrade eslint to v9
test: add accessibility announcement tests
```

## Sending a Pull Request

> **First time?** Check out [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

1. Fork the repository
2. Create a branch following the naming convention above
3. Make your changes
4. Run `yarn validate` to ensure everything passes
5. Push and open a PR against `main`
6. Fill out the PR template

### PR Guidelines

- **Keep PRs focused** — one feature or fix per PR
- **No breaking changes** without discussion — open an issue first
- **Add tests** for new features
- **Update docs** if you change the public API
- **Don't commit build output** (`lib/` is gitignored)

## Publishing (Maintainers)

We use [release-it](https://github.com/release-it/release-it) for releases:

```sh
yarn release
```

This will:
1. Bump the version based on conventional commits
2. Update CHANGELOG.md
3. Create a git tag
4. Push the tag (triggering the GitHub Release workflow)
5. Publish to npm

## Questions?

- Open a [Discussion](https://github.com/himanshu-lal4/react-native-tour-guide/discussions)
- File a [Bug Report](https://github.com/himanshu-lal4/react-native-tour-guide/issues/new?template=bug_report.yml)
- Request a [Feature](https://github.com/himanshu-lal4/react-native-tour-guide/issues/new?template=feature_request.yml)
