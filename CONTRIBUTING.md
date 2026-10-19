# Contributing

Atlas React Kit is the shared UI for Atlas apps. Changes land here, ship as a
package version, and apps upgrade deliberately. People and AI agents follow
the same steps.

## Set up and check

Working on the kit needs Node 22.12 or newer (Vitest 5). Apps that install
the package only need Node 20.19.

```sh
npm ci
npm ci --prefix site
npm run check                     # typecheck and Prettier
npm run test:coverage             # behavior and package tests, coverage floors
npm run build --prefix site       # Storybook build and site tests
npm run dev --prefix site         # Storybook playground on port 6006
npx playwright install chromium   # once, for the browser checks
npm run test:a11y --prefix site   # token contrast, axe on every story and open overlay
npm run test:visual --prefix site # screenshots of every component, light, dark, 390px
```

CI runs all of these on every pull request. Run them before you push.

## Commit and push checks

`npm ci` installs git hooks ([lefthook.yml](./lefthook.yml)) that block a
commit or push until the code passes. People and AI agents get the same
hooks.

- **On commit**, for the staged files: Prettier, oxlint, and a secret scan
  (secretlint).
- **On push**, `npm run gate`: `npm run check`, then `npm run gate:static`
  (oxlint with type information, knip, Semgrep, secretlint), the bundle-size
  budgets (size-limit), and the tests with coverage. CI runs the same
  `npm run gate` on every pull request, so a push that passes the hook
  passes CI.

What each tool checks and where its rules live:

| Check    | Tool                                          | Rules                |
| -------- | --------------------------------------------- | -------------------- |
| Lint     | oxlint with type-aware rules (TypeScript 7)   | `.oxlintrc.json`     |
| Unused   | knip: unused files, exports, and dependencies | `knip.json`          |
| Security | Semgrep, offline, on `src/`                   | `.semgrep.yml`       |
| Secrets  | secretlint                                    | `.secretlintrc.json` |
| Size     | size-limit, brotli size of `dist/`            | `.size-limit.json`   |

Semgrep is a Python tool: install it once with `brew install semgrep` (or
`pipx install semgrep`). The push fails, rather than skipping, when it is
missing.

When a check fails, fix the code: delete what knip reports unused, rework
what Semgrep flags, and shrink a module that grew past its budget before
you think about raising the budget. Raise a budget or turn off a rule only
for a reason you can state, in the same commit, so review sees it.

AI agents never skip the hooks (`--no-verify`, `LEFTHOOK=0`, or changing
`core.hooksPath`). A person can, in an emergency: `git push --no-verify`.
CI runs the same gate, so a skipped hook still fails the pull request.

## Add a component

1. `src/<name>.tsx`, following [DESIGN_RULES.md](./DESIGN_RULES.md): semantic tokens, square
   corners, `"use client"` when it uses hooks or handlers. Build on Radix
   primitives from `radix-ui` when one exists. Take focus, invalid,
   disabled, field, selected, and option states from
   `src/internal/styles.ts` instead of typing the classes;
   `test/dry.test.ts` fails on a retyped state.
2. An export in `package.json`; `test/artifact.test.ts` fails when a module
   in `src/` has none.
3. A shared example in `stories/` and a Storybook file in `site/stories/`
   with a `Playground` whose controls drive the component. Title it
   `<Group>/<Name>` with the sidebar group people would look in (the
   `storySort` list in `site/.storybook/preview.tsx`). The site tests fail
   when an export or example has no story, or a story has no group.
4. A usage entry in `site/src/lib/usage.ts` (use for, not for,
   accessibility). The site tests fail without one.
5. Tests in `test/<name>.test.tsx`, next to the component's existing cases,
   for the behavior people rely on: roles, keyboard, labels, state changes.
   `npm run test:coverage` fails below the floors in `vitest.config.ts`
   (95% of lines).
6. A screenshot entry in `site/tests/visual/components.spec.ts` (and in
   `phoneStories` if its layout changes at 390px); the visual test fails
   when a component page has none. If it opens an overlay, list it in
   `site/tests/overlays.mjs` instead (id, what it shows, how to open it):
   the screenshot captures it open and axe scans it open.
7. A row in [COMPONENTS.md](./COMPONENTS.md). New components start as **beta**: add them to
   the Status list there and to `beta` in `site/src/lib/usage.ts`.
8. When it covers a common need, a row in the agent skill's table in
   `skills/atlas-react-kit/SKILL.md`.
9. A `CHANGELOG.md` entry under Unreleased.

If the accessibility check fails, fix the component or the token, not the
check. If screenshots change on purpose, run `npm run test:visual:update
--prefix site` and commit the new baselines with the change.

## Layers

Files stay flat, so every import path is `atlas-react-kit/<name>`, but
imports follow layers, bottom to top:

- **Helpers**: `utils.ts` and `src/internal/` (shared classes and hooks).
- **Components**: the top-level modules. A component may build on others
  (`Combobox` uses `Button`, `Input`, and `Popover`; `DatePickerButton`
  uses `Calendar`).
- **Adapters**: `src/form/` (form-library fields) and `src/next/`
  (framework links).

Imports point down or sideways, never up, and never in a cycle, so apps can
use any component without pulling in an adapter. `test/layers.test.ts`
checks this.

## Change a component or token

- Keep changes additive when you can: a new prop or variant rather than a
  changed default.
- Token changes affect every app. Check contrast in both themes (the
  accessibility check does this for every story) and say what changed in
  the changelog.
- Update `DESIGN_RULES.md`, `COMPONENTS.md`, and the skill when a rule or
  API they describe changes. The skill sends agents to these files, so a
  stale sentence there becomes wrong code in apps.

## Versions and releases

The package follows semantic versioning.

From 1.0, a **major** release is needed for any breaking change to a
stable component. Breaking means removing or renaming an export, a prop, a
public token, or a documented `data-slot`; narrowing a prop's type; or
changing a default prop value. Visual-only changes (spacing, color values
within a token, animation) are minor. Beta components stay exempt (see
"Status labels" below). Radix-based components pass through their primitive's props, so a `radix-ui`
major upgrade ships as a kit major.

- **Minor** (1.x.0): new components, props, exports, or tokens, visual
  changes, and any change to a beta component's API.
- **Patch** (1.x.y): bug fixes that change no API.

To release, bump `version` in `package.json`, rename the changelog's
Unreleased heading to the version and date, and update the version in the
README install snippet. Merging that to `main` publishes to npm through the
release workflow (OIDC trusted publishing) after check, test, and pack
pass. Versions already on npm are skipped.

If trusted publishing is not configured, pack and publish a validated
artifact with the package owner's npm login:

```sh
mkdir -p release-artifacts
npm pack --pack-destination release-artifacts
npm publish ./release-artifacts/*.tgz --access public
```

## Deprecations

1. Mark the export or prop `@deprecated` in its JSDoc with the replacement.
2. Add a "Deprecated" changelog entry and update `COMPONENTS.md`.
3. Keep it working for at least one minor release.
4. Remove it in the next major release with a "Removed" changelog entry.

## Status labels

- **Beta**: new, or still settling. The API may change in a minor release;
  the changelog calls out every change.
- **Stable**: changes go through the deprecation steps above.

Promote a component to stable once apps have used it for a release without
API changes.
