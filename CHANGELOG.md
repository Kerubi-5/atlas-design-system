# Changelog

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
