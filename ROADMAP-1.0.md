# Road to 1.0

Handoff for whoever (person or AI agent) takes atlas-react-kit from 0.8 to
1.0. Read this, then `CONTRIBUTING.md`, `DESIGN_RULES.md`, and
`COMPONENTS.md`. Do not bump to 1.0.0 until every box below is checked.

## Where 0.8.0 stands

- Published on npm as `atlas-react-kit@0.8.0` (`latest`), tagged `v0.8.0`
  with a GitHub Release. Every published version has a tag and a release.
- 52 entry points, 188 tests in 31 files, coverage floors of 95% lines /
  88% branches enforced in `vitest.config.ts`.
- CI gates every pull request on typecheck, Prettier, tests, WCAG 2.2 AA
  (axe on every story and open overlay), and screenshots in light, dark,
  and 390px.
- The release workflow publishes, tags, and writes the GitHub Release from
  the changelog. A merge that does not change `version` publishes nothing.

## Guardrails already in place

| Guard          | File                       | What it stops                              |
| -------------- | -------------------------- | ------------------------------------------ |
| API snapshot   | `test/api-surface.test.ts` | Silent renames or removals of exports      |
| Layer check    | `test/layers.test.ts`      | Components importing adapters, cycles      |
| DRY states     | `test/dry.test.ts`         | Retyped focus / invalid / disabled classes |
| Package check  | `test/artifact.test.ts`    | Missing exports, missing `"use client"`    |
| Contrast + axe | `site/tests/`              | Accessibility regressions                  |
| Screenshots    | `site/tests/visual/`       | Unintended visual changes                  |

When the API snapshot fails: an added export is fine (`npx vitest run -u`,
changelog entry). A renamed or removed one is breaking: follow the
deprecation steps in `CONTRIBUTING.md` instead.

## Exit criteria for 1.0

### API freeze

- [ ] Review every entry point in `package.json` `exports`. For each, decide
      keep, rename, or remove. Do renames now (0.9) with a deprecated alias,
      not after 1.0.
- [ ] Review prop names for consistency across components (`onValueChange`
      vs `onChange`, `size` scales, `variant` names). Record decisions in
      `DESIGN_RULES.md`.
- [ ] Confirm no third-party types leak through the public types (0.8.0 did
      this for toasts; check `calendar`/`date-picker` re-exports of
      `react-day-picker` types and `radix-ui` prop types).
- [ ] Decide which CSS tokens and `data-slot` names in `theme.css` are public
      API, and list them in `DESIGN_RULES.md`.

### Beta components

Each must be promoted to stable or explicitly kept beta in 1.0 (listed in
`COMPONENTS.md` Status): `accordion`, `alert`, `avatar`, `breadcrumb`,
`color-legend`, `date-time-picker`, `dropdown-menu`, `info-tip`, `markdown`,
`meter`, `pagination`, `progress`, `radio-group`, `search-picker`, `slider`,
`spinner`, `stat-tile`, `switch`, `tooltip`.

- [ ] Promote each one that apps have used for a release without API change.
- [ ] Anything still beta at 1.0 is documented as exempt from semver.

### Support policy

- [ ] Write the supported ranges into `README.md`: React 19, Next 16
      (optional), Tailwind 4, Node >= 20.19.
- [ ] Define what counts as breaking after 1.0: export names, prop names and
      types, default prop values, public tokens, documented `data-*` hooks.
      Visual-only changes are minor.

### Quality

- [ ] Coverage: raise branch floor to 90%. Lowest today: `form/markdown-field`,
      `form/text-field`, `table`, `theme-provider`.
- [ ] Deferred major upgrades, each in its own PR with screenshots checked:
      TypeScript 7, `@vitest/coverage-v8` 5 (with Vitest 5), `next` 16.4
      dev dependency.
- [ ] Every component page has a usage entry and a screenshot (already
      enforced; confirm still green).

### Dogfooding

- [ ] At least one Atlas app on the latest 0.9.x for a full release cycle
      with no kit-caused breaking changes.

## Suggested path

1. **0.8.x** patches only: bug fixes, tests, docs. No API change.
2. **0.9.0**: all renames and removals from the API freeze, each with a
   deprecated alias and migration notes under "Breaking".
3. **0.9.x**: apps migrate; aliases stay.
4. **1.0.0**: remove 0.9 aliases, promote betas, add the support policy,
   update `CONTRIBUTING.md` "Versions and releases" to post-1.0 rules (any
   breaking change to a stable API is a major).

## Cutting a release (any version)

1. Bump `version` in `package.json`.
2. Rename the changelog's Unreleased heading to `## X.Y.Z - YYYY-MM-DD`.
3. Update the version in the README install snippet.
4. Merge to `main`. The release workflow publishes to npm, then creates the
   `vX.Y.Z` tag and GitHub Release from that changelog section.
