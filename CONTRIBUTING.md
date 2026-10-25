# Contributing

Atlas React Kit is the shared UI for Atlas apps. Changes land here, ship as a
package version, and apps upgrade deliberately. People and AI agents follow
the same steps.

## Set up and check

Working on the kit needs Node 22.19 or newer: Vitest 5 needs 22.12, and
`npm run size` (size-limit 14, which uses `fs.promises.glob`) needs 22.19.
Apps that install the package need only the Node versions in `engines` in
`package.json`.

```sh
npm ci
npm ci --prefix site
npm run gate                      # the checks the push hook runs
npm run build --prefix site       # Storybook build and site tests
npm run dev --prefix site         # Storybook playground on port 6006
npx playwright install chromium   # once, for the browser checks
npm run test:a11y --prefix site   # token contrast, axe on every story and open overlay
npm run test:visual --prefix site # screenshots of every component, light, dark, 390px
```

The scripts in `package.json` say what each command runs. CI runs the gate
and the site checks on every pull request
([check.yml](./.github/workflows/check.yml)); run them before you push.

## Commit and push checks

`npm ci` installs git hooks ([lefthook.yml](./lefthook.yml)) that block a
commit or push until the code passes: quick checks on the staged files at
commit, and `npm run gate` at push. People and AI agents get the same
hooks.

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
`core.hooksPath`). A person can, in an emergency: `git push --no-verify`;
CI still fails the pull request.

## Add a component

1. `src/<name>.tsx`, following [DESIGN_RULES.md](./DESIGN_RULES.md): semantic tokens, square
   corners, `"use client"` when it uses hooks or handlers. Build on Radix
   primitives from `radix-ui` when one exists. Take focus, invalid,
   disabled, field, selected, and option states from
   [shared state styles](./src/internal/styles.ts) instead of typing the classes;
   the [DRY checks](./test/dry.test.ts) fail on a retyped state.
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
   `npm run test:coverage` fails below the coverage floors in
   `vitest.config.ts`.
6. A screenshot entry in `site/tests/visual/components.spec.ts` (and in
   `phoneStories` if its layout changes at 390px); the visual test fails
   when a component page has none. If it opens an overlay, list it in
   `site/tests/overlays.mjs` instead (id, what it shows, how to open it):
   the screenshot captures it open and axe scans it open.
7. A row in [COMPONENTS.md](./COMPONENTS.md). New components start as **beta**: add them to
   the Status list there, which the docs site reads its beta labels from.
8. When it covers a common need, a row in the agent skill's table in
   `skills/atlas-react-kit/SKILL.md`.
9. A `CHANGELOG.md` entry under Unreleased.

If the accessibility check fails, fix the component or the token, not the
check. If screenshots change on purpose, run `npm run test:visual:update
--prefix site` and commit the new baselines with the change.

## Layers

Files stay flat, so every import path is `atlas-react-kit/<name>`, but
imports follow layers, bottom to top:

- **Helpers**: [utils](./src/utils.ts) and `src/internal/` (shared classes and hooks).
- **Components**: the top-level modules. A component may build on others
  ([Combobox](./src/combobox.tsx) uses `Button`, `Input`, and `Popover`;
  [PickerShell](./src/picker-shell.tsx) composes the calendar for both date pickers).
- **Adapters**: `src/form/` (form-library fields) and `src/next/`
  (framework links). The [form shell](./src/form/field-shell.tsx) owns label,
  hint, and error wiring; [Next NavLink](./src/next/nav-link.tsx) delegates to
  the core navigation component.

Imports point down or sideways, never up, and never in a cycle, so apps can
use any component without pulling in an adapter. The [layer checks](./test/layers.test.ts)
enforce this direction and reject import cycles.

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

To release, run `npm version X.Y.Z --no-git-tag-version` (it updates
`package.json` and `package-lock.json`) and rename the changelog's
Unreleased heading to the version and date. Merging that to `main` runs the
release workflow, which publishes to npm (OIDC trusted publishing) once the
Check workflow passes on that commit. Versions already on npm are skipped.

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
