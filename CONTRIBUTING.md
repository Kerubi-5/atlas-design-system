# Contributing

Atlas React Kit is the shared UI for Atlas apps. Changes land here, ship as a
package version, and apps upgrade deliberately. People and AI agents follow
the same steps.

## Set up and check

```sh
npm ci
npm ci --prefix site
npm run check                     # typecheck and Prettier
npm run test:coverage             # behavior and package tests, coverage floors
npm run build --prefix site       # Storybook build and site tests
npx playwright install chromium   # once, for the browser checks
npm run test:a11y --prefix site   # token contrast, axe on every story and open overlay
npm run test:visual --prefix site # screenshots of every component, light, dark, 390px
```

CI runs all of these on every pull request. Run them before you push.

## Add a component

1. `src/<name>.tsx`, following `DESIGN_RULES.md`: semantic tokens, square
   corners, `"use client"` when it uses hooks or handlers. Build on Radix
   primitives from `radix-ui` when one exists. Take focus, invalid,
   disabled, field, selected, and option states from
   `src/internal/styles.ts` instead of typing the classes;
   `test/dry.test.ts` fails on a retyped state.
2. An export in `package.json`, and the module in `test/artifact.test.ts`
   (the module list, plus the `"use client"` list when it applies).
3. A shared example in `stories/` and a Storybook file in `site/stories/`
   with a `Playground` whose controls drive the component. Title it
   `<Group>/<Name>` with the sidebar group people would look in:
   Foundations, Actions, Forms, Navigation, Feedback, Overlays, Data
   display, or Layout (the list is `storySort` in
   `site/.storybook/preview.tsx`). The site tests fail when an export or
   example has no story, or a story has no group.
4. A usage entry in `site/src/lib/usage.ts` (use for, not for,
   accessibility). The site tests fail without one.
5. Tests in `test/` for the behavior people rely on: roles, keyboard,
   labels, state changes. `npm run test:coverage` fails below the floors in
   `vitest.config.ts` (94% of lines).
6. A screenshot entry in `site/tests/visual/components.spec.ts` (with an
   `open` step if it shows an overlay, and in `phoneStories` if its layout
   changes at 390px); the visual test fails when a component page has none.
   If it opens an overlay, add it to `OVERLAYS` in `site/tests/a11y.test.mjs`
   so axe scans it open.
7. A row in `COMPONENTS.md`. New components start as **beta**: add them to
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

The package follows semantic versioning; before 1.0:

- **Minor** (0.x.0): new components, props, or exports, visual token
  changes, and any change to a beta component's API.
- **Patch** (0.x.y): bug fixes that don't change the API.
- **Breaking changes** to stable components only ship in a minor release,
  after a deprecation, with migration notes under "Breaking" in the
  changelog.

To release, bump `version` in `package.json`, rename the changelog's
Unreleased heading to the version and date, and update the version in the
README install snippet. Merging that to `main` publishes to npm through the
release workflow (OIDC trusted publishing) after check, test, and pack
pass. Versions already on npm are skipped.

## Deprecations

1. Mark the export or prop `@deprecated` in its JSDoc with the replacement.
2. Add a "Deprecated" changelog entry and update `COMPONENTS.md`.
3. Keep it working for at least one minor release.
4. Remove it in a later minor release with a "Removed" changelog entry.

## Status labels

- **Beta**: new, or still settling. The API may change in a minor release;
  the changelog calls out every change.
- **Stable**: changes go through the deprecation steps above.

Promote a component to stable once apps have used it for a release without
API changes.
