# Changelog

## 0.6.1 - 2026-10-10

Patch release: shared state classes and the consistency fixes they exposed.
No API changed; upgrading needs no code changes.

- Focus, invalid, disabled, field, selected, and option states come from one
  module (`src/internal/styles.ts`), so they look the same in every
  component. Fixes found while unifying them:
  - A destructive `Badge` used as a link drew a translucent red focus ring
    (about 1.5:1); it now gets the solid focus ring.
  - `Toggle` showed no ring when `aria-invalid`; `RadioGroupItem` and
    `Switch` had no dark-mode invalid style.
  - Disabled `Textarea`, `SelectTrigger`, `Checkbox`, `RadioGroupItem`, and
    `Switch` now ignore hover and clicks like disabled buttons
    (`pointer-events: none`) instead of only showing a not-allowed cursor.
  - `SearchPicker`'s highlighted option gets the grey fill as well as the
    bar, matching `Combobox`; tab triggers take the ring-colored border on
    focus like other controls.

## 0.6.0 - 2026-10-10

Minor release for visual token changes (WCAG 1.4.11 non-text contrast), a
ToggleGroup selected-state fix, and generic components extracted from QCheck
and KairOS so those apps can drop local copies in one upgrade. No existing
API changed.

- Non-text contrast: control boundaries, checked fills, selected states, and
  focus now reach 3:1 in both themes. A site test checks the token pairs in
  light and dark.
  - `--input` is darker (`oklch(0.62 0 0)` light, `oklch(0.52 0 0)` dark), so
    field, checkbox, radio, and switch-track boundaries are 3.6:1 on the page
    (they were 1.3:1). `--border` stays light for dividers and card edges.
  - Focus is a solid ring: `--ring` is the brand purple in light mode (7.3:1)
    and a light purple in dark mode (8.6:1), and every component uses
    `ring-ring` instead of a translucent glow (1.3–1.8:1 before). Keyboard-
    highlighted menu, select, and combobox options get a 2px ring-colored bar;
    the grey highlight alone was 1.1:1.
  - Dark `--primary` is lighter (`oklch(0.55 0.25 292.7)`), so checked
    checkboxes, radios, and switches reach 3:1 on dark surfaces (2.2:1 before);
    primary button text stays at 5:1.
  - The `--selected` wash mixes in oklab, so it is lavender instead of pink.
    Pressed toggles, active tabs, the current pagination page, and expanded or
    hovered outline buttons take a `border-selected-foreground` border, and
    selected table rows a leading bar, because the wash alone is 1.2:1.
- Toggle and ToggleGroup share one selected treatment: `bg-selected`,
  `text-selected-foreground`, and a `selected-foreground` border, keyed off
  `data-state=on`, `aria-pressed`, and `aria-checked`. Single-mode group items
  are radios with `aria-checked` (no `aria-pressed`), so they used to miss the
  pressed styles and render a pink fill without a border. Hover and focus use
  the same wash and the solid `ring-ring`.
- The Storybook manager tab title is "Atlas React Kit" (it was
  "storybook - Storybook").
- New components from the QCheck and KairOS audits (beta). Each is generic:
  no app domain types, copy, or data. `SectionHeading` is not shipped: it
  was one class string (`text-xs font-semibold tracking-widest
text-muted-foreground uppercase`). `CardTitle` / `DialogTitle` already
  own tracked headings, and `StatTile` exports `sectionLabel` for the same
  chrome. `BUDGET_HEADER_ACTION` stays in KairOS.
  - `InfoTip` / `InlineTip` (`atlas-react-kit/info-tip`): a Popover help
    glyph (20px icon, 44px hit). `layout` is `box` or `inline` (inline does
    not change line height). Hover opens only on a fine pointer; click, tap,
    and keyboard always work. Required `label`. Not a Tooltip, glossary, or
    "Coming soon" chip.
  - `ColorLegend` (`atlas-react-kit/color-legend`): swatch, optional range,
    and label. Overlay chrome is `className`. Attribution and license text
    stay in the app.
  - `SearchPicker<T>` (`atlas-react-kit/search-picker`): always-visible
    combobox + listbox (not Combobox's popover). Default filter is casefold
    - accent-fold includes. Arrows, Home/End, PageUp/PageDown, Enter, Escape.
  - `Markdown` / `MarkdownContent` (`atlas-react-kit/markdown`) and
    `FormMarkdownField` (`atlas-react-kit/form/markdown-field`): sanitized
    GFM (no Next, no raw HTML, no typography plugin). `react-markdown` and
    `remark-gfm` are regular dependencies imported only from the markdown
    subpath. Write / preview field uses the same `TextFieldApi` as
    `FormTextField`.
  - `StatTile` (`atlas-react-kit/stat-tile`): label, tabular value, optional
    sub and children, plus `statTileGrid` and `sectionLabel`.
  - `Meter` (`atlas-react-kit/meter`): track, fill, optional markers
    (`position` on the value scale). `role="meter"` with aria values.
    Separate from `Progress`.
  - `Slider` (`atlas-react-kit/slider`): Radix Slider, number `value`,
    44px thumb hit, square track, primary fill, solid focus ring.

## 0.5.0 - 2026-10-10

Minor release that adds a date-time picker and 11 components (accordion,
alert, avatar, breadcrumb, dropdown menu, pagination, progress, radio group,
spinner, switch, and tooltip), the shipped agent skill, the `FormTextField`
`id` prop, the public `tabsTriggerVariants` export, and `Combobox`
`aria-label`, plus QA and accessibility fixes. No existing API changed.
Light-mode muted and destructive text are darker, and brand-colored hover
text uses `text-selected-foreground`, so every Storybook story passes the
automated WCAG 2.2 AA check in both themes.

- `DateTimePickerButton` (`atlas-react-kit/date-time-picker`) and
  `FormDateTimePickerField` (`atlas-react-kit/form/date-time-picker-field`)
  pick a local date and time from Calendar, hour/minute selects, and Clear.
  The controlled value is `Date | null`. `timeStep` (default 15) steps the
  minute list. The trigger uses the shared form-control chrome; the popover
  stays on-screen at 390px.

- The package ships `skills/atlas-react-kit/SKILL.md`, an agent skill that
  points AI coding assistants at the guides for the installed version, maps
  common needs to kit components, and lists checks for raw palette colors,
  rounded corners, and non-public imports. The README shows how to link it
  into `.claude/skills/`.

- `Combobox` clears its search after a selection. Before, the old query
  stayed, the highlight landed on the wrong row on reopen, and Enter could
  replace the value with a different option. Option ids are now index-based
  so values with spaces still give valid `aria-activedescendant` targets.
- `ThemeProvider`'s `d` shortcut no longer fires inside widgets with letter
  typeahead (`Select`, listboxes, menus, grids, ARIA text fields), when a
  focused control already handled the key, on key repeat, or during IME
  composition. Typing `d` on a `Select` used to change both the value and
  the theme.
- `DatePickerButton` in range mode starts a new range on the first click
  when it opens on a complete range. Before, that click extended the old
  range and closed the popover, so picking a fresh range needed Clear.
- `FormTextField` accepts an optional `id` (default stays `field.name`) for
  pages where two forms share a field name.
- `tabsTriggerVariants` is exported from `atlas-react-kit/tabs` so `TabsNav`
  links can match tab styling without the Next adapter.
- New components: `accordion`, `alert`, `avatar`, `breadcrumb`,
  `dropdown-menu`, `pagination`, `progress`, `radio-group`, `spinner`,
  `switch`, and `tooltip`. They follow the shape rules (square, except round
  radio dots and avatars), use `bg-selected` for the current page and focus
  styles shared with existing controls, and keep status tones off body text.
- Accessibility gate: CI runs axe-core's WCAG 2.2 A/AA rules on every
  Storybook story in light and dark mode. Fixes for what it found:
  - `--muted-foreground` (light) is `oklch(0.53 0 0)`, so muted text passes on
    `bg-muted` as well as the page (it was 4.3:1).
  - `--destructive` (light) is `oklch(0.505 0.213 27.518)`, so destructive
    text passes on its own soft tint (it was 3.6:1). The soft destructive
    `Badge` tone and the destructive `Button` are now AA in both themes.
  - Outline/ghost button and toggle hovers, link buttons, and field
    description links use `text-selected-foreground` instead of
    `text-primary`, which was about 2:1 on the dark background.
  - Calendar day buttons are named "Tuesday, October 27, 2026" (no ordinal)
    so the name contains the visible number (WCAG 2.5.3).
  - `Table`'s scroller joins the tab order while it overflows, so keyboard
    users can scroll it.
  - `Combobox` accepts `aria-label` and `aria-labelledby`.

## 0.4.1

Patch so default-density tables scroll inside a ~390px panel instead of
widening the page.

- `Table` keeps its overflow wrapper and adds `min-w-0 max-w-full` plus
  overscroll containment so nowrap columns never stretch a card or flex
  parent. Edge fades in `theme.css` cue horizontal overflow (LICENSE no
  longer looks merely truncated).
- `TableHead` / `TableCell` use `px-2` below `sm` and the previous padding
  from `sm` up.
- `Card`, `CardHeader`, `CardContent`, and `CardFooter` get `min-w-0` so
  nested tables can shrink and scroll. Height behavior
  (`min-h-min shrink-0`) is unchanged.

`InfoTip` is not in this kit; 44px "?" hit-area line-height issues stay
with the app that owns that component.

## 0.4.0

Minor release so apps can use kit form controls and cards without workarounds.

- `DatePickerButton` and `Combobox` triggers use shared form-control chrome
  matching `Input` / `SelectTrigger` (40px, `px-3`, `text-base md:text-sm`,
  `border-input`, background, shadow) instead of outline Button type styles.
- `FormDatePickerField` forwards `className` to the trigger.
- `Card` uses `min-h-min` so it does not collapse to a title strip inside a
  bounded flex column. `overflow-hidden` remains for media clipping.
- Card padding lives in `theme.css` `@layer components` via `--card-p`, so
  `flush` and `CardContent className="px-0"` override it without `!px-0`.
- Range `DatePickerButton` defaults to one month below `md` and two at `md+`,
  clamps the popover to the viewport (`max-height` + scroll, collision
  padding), and accepts `side`. Explicit `numberOfMonths` still wins.
- `SelectTrigger` uses `text-base md:text-sm` like `Input` to avoid iOS zoom.
- Outline and ghost `Button` (and outline `Toggle`) hover/focus use brand
  purple border and text with the selected wash. No muted grey fill, so
  actions like "Clear selection" stay clean on selected rows. Form-control
  triggers still hover like Input.

## 0.3.0

Minor release. Combobox keyboard highlight now scrolls the active option
into view, including Home, End, PageUp, PageDown, and arrows, so a long
list (for example a 400-option timezone picker) no longer leaves the
highlighted row off-screen. `DatePickerButton` gains `mode="range"` with a
from/to value, optional `numberOfMonths` (default 2), and a Clear action,
so apps can drop hand-composed Calendar + Popover range pickers.

## 0.2.1

Patch release of the Combobox keyboard contract that landed after 0.2.0 was
already published. Home and End move the highlight to the first and last
filtered option and prevent the default caret jump, matching the listbox
pattern consumers already rely on. Behavior tests cover Combobox, calendar
and date pickers, ThemeProvider, SortableTableHead, ErrorBoundary, overlays,
toggles, and display primitives.

## 0.2.0

ThemeProvider, ErrorBoundary, Combobox, date picker field, and a sortable
table header as subpath exports.
