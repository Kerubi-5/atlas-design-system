# Changelog

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
