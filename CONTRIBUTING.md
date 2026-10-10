# Contributing

Atlas React Kit is the shared UI for Atlas apps. Changes land here, ship as a
package version, and apps upgrade deliberately. People and AI agents follow
the same steps.

## Set up and check

```sh
npm ci
npm ci --prefix site
npm run check                     # typecheck and Prettier
npm test                          # behavior and package tests
npm run build --prefix site       # Storybook build and site tests
npx playwright install chromium   # once, for the browser checks
npm run test:a11y --prefix site   # axe, WCAG 2.2 AA, every story, light and dark
npm run test:visual --prefix site # screenshot comparison
```

CI runs all of these on every pull request. Run them before you push.

## Add a component

1. `src/<name>.tsx`, following `DESIGN_RULES.md`: semantic tokens, square
   corners, the shared focus ring, `"use client"` when it uses hooks or
   handlers. Build on Radix primitives from `radix-ui` when one exists.
2. An export in `package.json`, and the module in `test/artifact.test.ts`
   (the module list, plus the `"use client"` list when it applies).
3. A shared example in `stories/` and a Storybook file in `site/stories/`
   with a `Playground` whose controls drive the component. The site tests
   fail when an export or example has no story.
4. A usage entry in `site/src/lib/usage.ts` (use for, not for,
   accessibility). The site tests fail without one.
5. Tests in `test/` for the behavior people rely on: roles, keyboard,
   labels, state changes.
6. A row in `COMPONENTS.md`. New components start as **beta**: add them to
   the Status list there and to `beta` in `site/src/lib/usage.ts`.
7. When it covers a common need, a row in the agent skill's table in
   `skills/atlas-react-kit/SKILL.md`.
8. A `CHANGELOG.md` entry under Unreleased.

If the accessibility check fails, fix the component or the token, not the
check. If screenshots change on purpose, run `npm run test:visual:update
--prefix site` and commit the new baselines with the change.

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
