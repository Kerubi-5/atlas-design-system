# Road to 1.0

Closed: 1.0.0 shipped on 2026-10-18. Kept as the record of the decisions
behind it.

## Exit criteria for 1.0

### API freeze

- [x] Review every entry point in `package.json` `exports`. For each, decide
      keep, rename, or remove. Do renames now (0.x) with a deprecated alias,
      not after 1.0. Reviewed at 0.13: keep all 66 entries. `next/nav-link`
      and `next/tabs-nav-link` share one contract but style different
      shells, so both stay.
- [x] Review prop names for consistency across components (`onValueChange`
      vs `onChange`, `size` scales, `variant` names). Record decisions in
      `DESIGN_RULES.md`. Conventions are recorded there. The two stable
      exceptions were renamed with deprecated aliases (#58):
      `DatePickerButton` and `DateTimePickerButton` take `onValueChange`,
      and `EmptyPanel` `size` is `sm | default | lg`.
- [x] Confirm no third-party types leak through the public types (0.8.0 did
      this for toasts; check `calendar`/`date-picker` re-exports of
      `react-day-picker` types and `radix-ui` prop types). Done for Day
      Picker: the pickers and form fields use the kit's own `DateRange`,
      `DateMatcher`, and calendar options, enforced by
      `test/type-leaks.test.ts`; `Calendar` stays a documented Day Picker
      wrapper. Radix-based components pass through their primitive's props
      on purpose (they are Radix wrappers, like `Calendar` is for Day
      Picker); `CONTRIBUTING.md` says a `radix-ui` major is a kit major.
- [x] Decide which CSS tokens and `data-slot` names in `theme.css` are public
      API, and list them in `DESIGN_RULES.md`. Listed under "Public tokens
      and slots".

### Beta components

For every component in the [current beta list](./COMPONENTS.md#status), decide
whether to promote it or keep it beta in 1.0.

- [x] Promote each one that apps have used for a release without API change.
      Promoted: `alert`, `markdown`, `meter`, `progress`, `slider`,
      `stat-tile`, `tooltip` (KairOS), `date-time-picker` (KairOS),
      `color-legend`, `info-tip`, `search-picker` (QCheck). Kept beta because
      no app uses them yet: `accordion`, `avatar`, `breadcrumb`,
      `dropdown-menu`, `pagination`, `radio-group`, `spinner`, `switch`, and
      the new `nav-link`.
- [x] Anything still beta at 1.0 is documented as exempt from semver.

### Support policy

- [x] Write the supported ranges into `README.md`: React 19, Next 16
      (optional), Tailwind 4, Node >= 20.19.
- [x] Define what counts as breaking after 1.0: export names, prop names and
      types, default prop values, public tokens, documented `data-*` hooks.
      Visual-only changes are minor. Written into `CONTRIBUTING.md`.

### Quality

- [x] Raise the branch coverage floor to 90%.
- [x] Deferred major upgrades, each in its own PR with screenshots checked:
      TypeScript 7 (#47), `@vitest/coverage-v8` 5 with Vitest 5 (#49),
      `next` 16.4 dev dependency.
- [x] Every component page has a usage entry and a screenshot (already
      enforced; confirm still green). The site job in CI enforces it.

### Quality audit (2026-10-17)

- [x] WCAG 2.2 AA beyond axe: every story is checked for visible keyboard
      focus in light, dark and forced colors, focus covered by other
      content, reflow at 320px, and WCAG text spacing
      (`site/tests/wcag-behavior.test.mjs`). It found 236 problems: focus
      vanished in Windows High Contrast, tab panels had no focus ring, and a
      toggle group overflowed at 320px. All fixed in #62.
- [x] Overlays by keyboard: Escape closes each one and returns focus to its
      trigger, date pickers focus the selected day, tooltips stay open on
      hover, toasts use a polite live region. No changes needed.
- [x] Render cost: `KanbanBoard` re-rendered every card on each scroll
      event and on any one-card change; now 0 and 1 renders (#63, with
      `test/render-performance.test.tsx`). Pickers already had render-count
      tests.
- [x] Bundle size, gzipped with React external: `button` 11 KB, `input`
      9 KB, `dialog` 27 KB, `select` 44 KB, `date-picker` 42 KB (calendar
      loads on first open); ten common entries together 60 KB. Most of it is
      Radix, Floating UI and tailwind-merge, shared across entries.

### Dogfooding

- [x] At least one Atlas app on the latest 0.x for a full release cycle
      with no kit-caused breaking changes. KairOS has run 0.13.0 since
      2026-10-16 (five PRs since, none fixing the kit). On the 1.0.0 build its
      typecheck, lint, 784 tests and build pass, and 11 screens render the
      same pixels as on 0.13.0 in light and dark (checked 2026-10-17).

## Release process

Use the versioning and release steps in [CONTRIBUTING.md](./CONTRIBUTING.md).
