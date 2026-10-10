# Changelog

## 0.5.0 - 2026-10-10

Minor release that adds 11 components (accordion, alert, avatar, breadcrumb,
dropdown menu, pagination, progress, radio group, spinner, switch, and
tooltip), the shipped agent skill, the `FormTextField` `id` prop, and the
public `tabsTriggerVariants` export, plus QA fixes for Combobox, the theme
shortcut, and range picking. Everything is additive; no existing API changed.

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
