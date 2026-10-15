# Road to 1.0

Handoff for whoever (person or AI agent) takes atlas-react-kit from 0.9 to
1.0. Read the [contribution guide](./CONTRIBUTING.md), [design rules](./DESIGN_RULES.md),
and [component guide](./COMPONENTS.md). Do not bump to 1.0.0 until every box
below is checked.

The 0.9.x release line is current. See the [changelog](./CHANGELOG.md) for
release history.

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

For every component in the [current beta list](./COMPONENTS.md#status), decide
whether to promote it or keep it beta in 1.0.

- [ ] Promote each one that apps have used for a release without API change.
      Done for `alert`, `markdown`, `meter`, `progress`, `slider`,
      `stat-tile`, and `tooltip`; the rest still need a decision.
- [ ] Anything still beta at 1.0 is documented as exempt from semver.

### Support policy

- [x] Write the supported ranges into `README.md`: React 19, Next 16
      (optional), Tailwind 4, Node >= 20.19.
- [ ] Define what counts as breaking after 1.0: export names, prop names and
      types, default prop values, public tokens, documented `data-*` hooks.
      Visual-only changes are minor.

### Quality

- [x] Raise the branch coverage floor to 90%.
- [ ] Deferred major upgrades, each in its own PR with screenshots checked:
      TypeScript 7, `@vitest/coverage-v8` 5 (with Vitest 5), `next` 16.4
      dev dependency.
- [ ] Every component page has a usage entry and a screenshot (already
      enforced; confirm still green).

### Dogfooding

- [ ] At least one Atlas app on the latest 0.9.x for a full release cycle
      with no kit-caused breaking changes.

## Release process

Use the versioning and release steps in [CONTRIBUTING.md](./CONTRIBUTING.md).
