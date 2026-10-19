# Changelog

## Unreleased

## 1.2.0 - 2026-10-20

Visual fixes for the layouts KairOS reported on production, plus the
internal style-sharing work already on main. No public props change;
apps only need to bump the package.

- `KanbanBoard` columns grow to fill the board (`flex-1 basis-72
min-w-72`) instead of staying a fixed 18rem. Boards with a few
  columns fill the row; boards with many (KairOS Leads ~10 stages)
  still scroll horizontally. `columnClassName` still overrides the
  default size.
- `TabsNav` and `TabsList` default row height matches `Button`
  `size="sm"`: the scroller is `h-9` (36px) with `p-1` around an
  `h-7` list, so the muted track no longer sits 16px taller than a
  small button. The list-plus-padding rule is unchanged, so the
  focus ring stays inside the box and no vertical scrollbar appears.
  The line variant is `h-10` for its underline. A list `className`
  height still replaces the default.

Internal only, plus one deprecation; the public API is unchanged.
Rendered classes are unchanged except where noted above.

- Deprecated: `selectedToggleChrome` from `toggle`; `toggleVariants()`
  already includes this chrome. It stays exported until 2.0.
- The inline icon rule (no pointer events, no shrinking, 14px unless the
  icon sets a size) now has one home, `inlineIcon` in the internal styles
  module; Button, Toggle, the tab triggers, Select and DropdownMenu compose
  it. Select's scroll buttons gain its two inert classes
  (`[&_svg]:pointer-events-none [&_svg]:shrink-0`) next to the icon size
  they already set.
- Control label text (Button, Toggle, Badge), the brand text hover and
  focus (BreadcrumbLink, AccordionTrigger, InfoTip) and the listbox scroll
  frame (Combobox, SearchPicker) each have one home there too, and
  `test/dry.test.ts` fails when a component retypes any of them.
- `InfoTip` reads the hover-capable media query through the kit's
  `useMediaQuery` hook instead of its own `matchMedia` call.
- `foldSearchText` lives in the internal search module beside the helpers
  that use it; `search-picker` still re-exports it.

## 1.1.0 - 2026-10-20

Additions apps were working around, with no change to existing types.

- `DatePickerButton` single mode takes `clearable`: a Clear row that emits
  `undefined` and closes the popover, and a second click on the selected
  day then keeps it. `FormDatePickerField` forwards it. Without
  `clearable`, nothing changes.
- `FormSelectField`, `FormDatePickerField`, and `FormDateTimePickerField`
  take an optional `id` for their control, like `FormTextField`; the
  default stays a generated id.
- New entry `form/focus-first-invalid`: `focusFirstInvalid(formId)` returns
  an invalid-submit handler (TanStack Form's `onSubmitInvalid`) that focuses
  the first control in the form whose field has errors, matched by control
  id. Give fields `id={field.name}`.
- `isNavActive(pathname, href)` from `nav-link`: true on the path itself
  or a page under it, for the `active` prop of both link kinds.
- `TabsNavLink` from `tabs`: the link inside `TabsNav` as a plain anchor
  (`asChild` for a router link), so apps outside Next no longer hand-roll
  `data-state` and `aria-current`. `next/tabs-nav-link` and `next/nav-link`
  now wrap the base links with `asChild`; their rendered markup is
  unchanged.
- `TabsNav` and `TabsList` rows that overflow can be dragged sideways with
  a mouse, as touch already could. A press becomes a drag after 4px, so a
  plain click still activates a tab or link, and the click after a drag is
  swallowed so a drag never also follows a link. Radix selects a
  `TabsTrigger` on press, so a drag that starts on an inactive tab still
  selects it. Markup, classes and keyboard behaviour are unchanged.
- `theme.css` sets `color-scheme: light` on `:root` and `color-scheme: dark`
  on `.dark`, so native scrollbars and form controls follow the theme.
- `DateTimePickerButton` drops two unused ids on its time selects (no
  rendered change).
- `DatePickerButton` and `DateTimePickerButton` now share their calendar
  wiring (date limits, `calendarProps`, focus on the selected day) and the
  Clear row, which closes the popover, through one internal picker shell.
- `DateTimePickerButton` drops its hand-written guard that kept the popover
  open when an hour or minute was picked. Radix already counts the portaled
  time selects as inside the popover, so choosing an option keeps it open
  with mouse, touch and keyboard (checked in Chromium).

## 1.0.0 - 2026-10-18

The first stable release. The public API (exports, props, public tokens and
documented slots) now follows the breaking-change rules in CONTRIBUTING.md:
breaking changes to stable components need a major release. Beta components
are exempt. Apps on 0.13 can upgrade without code changes.

Pieces apps were building by hand: a kanban board, chart basics, three
form fields, and page layout parts, plus readable picker values, dialog
titles, and easier Storybook browsing. Every change to the API is an
addition; existing types are unchanged. The range picker's first click now emits an
open-ended range (see Changed below).

- Faster `KanbanBoard`: scrolling no longer re-renders every card (300
  cards over 20 scroll events: 6,000 `renderCard` calls before, 0 now), and
  changing one item re-renders only that card when `renderCard` keeps its
  identity (300 calls before, 1 now).
- Accessibility: keyboard focus now shows in Windows High Contrast and
  other forced-colors modes, where the box-shadow focus ring disappeared on
  every control. Focusable `TabsContent` panels show the focus ring. A
  horizontal `ToggleGroup` wraps instead of pushing a 320px page sideways.
  A new site test checks every story for visible focus (light, dark and
  forced colors), focus covered by other content, 320px reflow, and WCAG
  text spacing, alongside the existing axe checks.
- Every prop the kit declares now has a doc comment, so editors and
  agents show what it does and its default. Props that several components
  share (form field labels, error timing, picker options, `asChild`) are
  typed and documented once. Prop types are unchanged.
- Deprecated: `DatePickerButton` and `DateTimePickerButton` take
  `onValueChange`, like every other controlled component; `onChange` still
  works until 2.0. `EmptyPanel` `size` is `sm | default | lg`; `md` still
  works as an alias of `default` until 2.0. The form fields and examples use
  the new names.
- `remark-parse` is no longer a required peer dependency. Only the kit's
  own docs-link check used it, so apps no longer install it for nothing.
  The README's theme setup now says `ThemeProvider` needs `next-themes`.
- Date picker values wrap inside narrow triggers so a full selected range
  stays visible; ordinary one-line controls remain 40px tall.
- Dialog titles leave room for the built-in close button when it is shown.
- Storybook uses one responsive canvas gutter and opens with a Start here
  guide linking existing components and examples.
- `Combobox` no longer focuses its search field from a
  `requestAnimationFrame` effect. Radix's popover focus already moves focus
  to the search field, its first tabbable, on open.
- The date picker's breakpoint check (`useMediaQuery`) uses React's
  `useSyncExternalStore`. Hydration now matches the server render instead of
  reading `matchMedia` in the first client render, which logged a hydration
  mismatch on screens at or above `md`.
- New beta `kanban` entry: `KanbanBoard` and `KanbanSkeleton`, a
  drag-and-drop board on dnd-kit (moved from KairOS). The consumer owns the
  items and gets one `onMove` with the neighbours' positions for every
  column change or reorder, plus optional Finish / Remove drop zones.
  `@dnd-kit/react` and `@dnd-kit/dom` are new optional peers, needed only
  for this entry.
- New beta `chart` entry: `chartFrame`, axis math (`niceCeil`,
  `niceTicks`, `scaleLinear`, `linePath`, `roundedTopBarPath`,
  `compactNumber`), `useChartScrub` for a pointer and arrow-key crosshair,
  `ChartYAxisGrid`, `ChartTooltip`, `ChartTooltipRow`, `ChartLegend`, and
  `ChartLegendKey`. Apps draw their own series in SVG on top.
- New form fields: `form/checkbox-field` (`FormCheckboxField`,
  `FormCheckboxGroupField`), `form/toggle-group-field`
  (`FormToggleGroupField`), and `form/combobox-field` (`FormComboboxField`),
  with the same label, hint, and error timing as the other `form/*` fields.
- New beta layout parts: `PageHeader` (`page-header`), `PeriodStepper`
  (`period-stepper`, and `next/period-stepper` for URL periods), and
  `SkipLink` (`skip-link`).
- Changed: the range date picker uses Day Picker's built-in `resetOnSelect`
  instead of its own restart flag. A click on a complete range starts a new
  one as before, but the start now reaches `onChange` as
  `{ from, to: undefined }` instead of a same-day range, and a one-day range
  takes a second click on the same day. Apps that treated one click as a
  one-day range should wait for `to`.

## 0.13.0 - 2026-10-16

Minor: form errors wait until a field is touched or the form is submitted,
a public `FormControlField` for custom controls, a shell `NavLink`, the beta
decisions for 1.0, and the kit's own date types in the picker API.

- Fixed: `form/*` fields showed `meta.errors[0]` on fields the person had
  not reached yet, so an app validating the whole form on change flagged
  every field at the first keystroke. `FieldMetaState` takes an optional
  `isTouched` (TanStack Form's `field.state.meta` already has it), and
  `FormTextField`, `FormMarkdownField`, `FormSelectField`,
  `FormDatePickerField`, and `FormDateTimePickerField` take an optional
  `submitted`. When `isTouched` is `false`, the error text, `aria-invalid`,
  and the error in `aria-describedby` wait until the field is touched or
  `submitted` is set. Meta without `isTouched` shows errors as before, and
  `showError={false}` still hides them; the select and date fields now take
  `showError` too.
- New: `FormControlField` and type `FormControlProps`
  (`atlas-react-kit/form/control-field`). It wraps a control the kit does not
  ship (a combobox) in the same label, required marker, hint, error, ids, and
  error timing as the other `form/*` fields: `children` receives `id`,
  `aria-invalid`, `aria-describedby`, and `aria-required` to spread on the
  control. `className` and other div props go to the wrapper.
- New type `ErrorTimingProps` in `form/field-error`.
- Docs: the error sits below the control and reserves no space; put a row of
  fields in a grid with `items-start` so the controls share a top edge
  (DESIGN_RULES.md, COMPONENTS.md "Forms").

- New: `NavLink` and `navLinkVariants` (`atlas-react-kit/nav-link`), a
  pill-style app-shell link. Pass `active` from the app; the kit has no
  router. `asChild` wraps a router `Link` (same Slot pattern as
  `BreadcrumbLink`). Active uses the shared selected chrome (`bg-selected`,
  `text-selected-foreground`, `border-selected-foreground`); inactive is
  `text-muted-foreground` with `hover:bg-accent`.
- New: optional Next adapter `atlas-react-kit/next/nav-link` (Next.js 16),
  the same shape as `TabsNavLink`: Next `Link` props plus required `active`.
- KairOS follow-up (separate PR): replace `components/app/nav-link.tsx`
  after this ships.
- `alert`, `markdown`, `meter`, `progress`, `slider`, `stat-tile`, and
  `tooltip` are stable. KairOS has used each one across releases, and their
  0.11 and 0.12 changes were additive. From now on, changes to them follow
  the deprecation policy in CONTRIBUTING.md. Nothing changes in the code.
- `date-time-picker` (used by KairOS) and `color-legend`, `info-tip`, and
  `search-picker` (used by QCheck) are stable too. `accordion`, `avatar`,
  `breadcrumb`, `dropdown-menu`, `nav-link`, `pagination`, `radio-group`,
  `spinner`, and `switch` stay beta until an app uses them; beta components
  are exempt from semver, before and after 1.0.
- Changed: `DateRange` is now the kit's own type, with the same
  `{ from, to }` shape as Day Picker's, so existing code keeps compiling.
  `DatePickerCalendarProps` (the pickers' `calendarProps`) is now the kit's
  own list of calendar options: `disabled` and `hidden` (as the new
  `DateMatcher` type), `startMonth`, `endMonth`, `weekStartsOn`, a date-fns
  `locale`, `showOutsideDays`, `fixedWeeks`, `showWeekNumber`,
  `captionLayout`, `today`, and `className`. Other Day Picker props are no
  longer accepted there. No picker or form field type mentions
  `react-day-picker` any more; `Calendar` still takes Day Picker's props.
- Build: compiled with TypeScript 7. Emitted JavaScript is identical; the
  declarations list string-literal union members in a different order, with
  no type change.
- Tests run on Vitest 5 and `@vitest/coverage-v8` 5. Contributors need
  Node 22.12 or newer; the package's own Node range is unchanged.
- The Next adapters (`next/nav-link`, `next/tabs-nav-link`) are built and
  tested against Next 16.4. The `next` peer range stays `^16.0.0`.

## 0.12.0 - 2026-10-15

Minor: date limits, a visible required marker, and toast stacks that meet
the 24px target size. Every change is additive; existing props keep their
behavior.

- `DatePickerButton`, `DateTimePickerButton`, `FormDatePickerField`, and
  `FormDateTimePickerField` take `minDate` and `maxDate` (`Date` or
  `yyyy-MM-dd`). Days outside them are disabled, alongside any
  `calendarProps.disabled`, and month paging stops there unless
  `calendarProps` sets `startMonth` / `endMonth`.
- `Label` (and so `FieldLabel`) takes `required`, which draws a visible `*`
  hidden from screen readers, and `requiredClassName` for its styling
  (`data-slot="label-required"`). `FormTextField`, `FormMarkdownField`,
  `FormSelectField`, and both date fields take `required`: the label is
  marked and the control is required (`required` on inputs and the textarea,
  `aria-required` on the select trigger, a "Required" description on the
  date triggers, which are buttons).
- `Toaster` expands its stack while keyboard focus is inside it, as it does
  on hover, and hides the parts of collapsed toasts behind the front one.
  Their close badges used to peek out above the front toast, closer together
  than WCAG 2.5.8 allows, and their buttons stayed in the tab order unseen.
- `DateLike` and `toDate` now live in an internal module; `date-picker`
  still exports both.

## 0.11.2 - 2026-10-14

Patch: Card accessibility and visible keyboard focus. The public API is unchanged.

- `Card` only applies accessible names when given a region or landmark role;
  ordinary cards no longer expose prohibited naming attributes.
- Controls separate their solid keyboard focus ring from filled backgrounds
  with a 2px gap, keeping the ring visible on primary buttons in both themes.

## 0.11.1 - 2026-10-14

Patch: calendar keyboard focus and picker rendering. The public API is
unchanged.

- `Calendar` keeps month-navigation keyboard focus when its parent
  re-renders. Those controls used to be recreated on every parent update,
  which dropped focus out of the grid.
- `Combobox` and `SearchPicker` highlight and filter long lists without
  re-rendering every row. Combobox creation checks are cached until the
  query or options change.

## 0.11.0 - 2026-10-12

Minor: bug and accessibility fixes from the 1.0 audit, less duplicated code,
and every part of every component styleable by apps. Defaults that change:

- `ThemeProvider` no longer turns on the `d` dark/light shortcut by default.
  A single-key shortcut fires by accident for speech-input users, and WCAG
  2.1.4 needs a way for people to turn it off. Pass `enableShortcut` to keep
  it, ideally with a setting that turns it off again.
- The outline `Button` border uses `border-input` (3.6:1 against the page)
  instead of `border-border` (1.3:1).
- `Pagination` no longer centers or stretches itself; add
  `className="justify-center"` for the old layout.
- `Field` stops forcing its children to full width (`*:w-full`). Controls
  still fill through the flex column, but a child's own width class now wins,
  so `FieldLabel` and a `ToggleGroup` keep their `w-fit`. `Field` and `Alert`
  drop their root `w-full`.
- A vertical `Tabs` list sizes to its tabs instead of filling the row.
- `Table` drops `min-w-full` from the `<table>`, so `className="w-auto"`
  sizes it to its columns.
- `className` now replaces `Avatar` size, `Separator` thickness, `TabsList`
  and `SelectTrigger` height, and a `Badge` icon's size: they were `data-*`
  variants or `!` classes that a plain class could not override.
- The built-in `Dialog` close button's slot is `dialog-close-button` (it
  shared `dialog-close` with your own `DialogClose`).
- `Combobox` search ignores accents ("nino" finds "Niño"), and its options
  use the same 10px icon gap as menu and select items. `SelectSeparator` is
  solid `bg-border` like the menu separator.

New:

- Part props and slots so apps can style what sits inside a component:
  `DialogContent` `overlayClassName` and `closeButtonClassName`,
  `TooltipContent` `arrowClassName`, `Combobox` `contentClassName`, date
  picker `contentClassName` and `calendarProps` (type
  `DatePickerCalendarProps`), `fieldClassName` on every `form/*` field (plus
  `className` on the control, `FormSelectField` `contentClassName` and
  `FormMarkdownField` `previewClassName`), `Table` `containerClassName`,
  `TabsList` and `TabsNav` `scrollerClassName`, `TabsNav` `listClassName`,
  `SortableTableHead` `buttonClassName`, `AccordionTrigger`
  `headerClassName`, `Progress` `indicatorClassName`, and `className` on
  `FieldError`, `FormFeedbackField`, `ErrorFallback` and `TableBodySkeleton`.
  `Combobox`, `SearchPicker`, `InfoTip`, `StatTile`, `ColorLegend`,
  `EmptyPanel`, `Meter` and `Slider` pass other props through. COMPONENTS.md
  lists every part prop and `data-slot` under "Styling parts".
- `PaginationLink`, `PaginationPrevious` and `PaginationNext` take
  `disabled` for a page that does not exist, such as Previous on page 1.
  It drops the `href`, dims the link and announces it as disabled.
- `CardTitle` `as` accepts `h2`, `h3` and `h4` for section headings.
- `DatePickerButton` and `DateTimePickerButton` forward `aria-labelledby`
  and `aria-describedby` to the trigger; the trigger text has the id
  `${id}-value`. `FieldError` takes an `id`.

Internal: the two date pickers share one trigger, popover and Clear footer;
overlays, menu rows, menu labels, hit areas and control sizes share class
strings in `src/internal/` (and `test/dry.test.ts` fails when they are
retyped); `Combobox` and `SearchPicker` share their option, empty-state and
keyboard code; the table and tab scroll shadows share one `theme.css` rule;
and the dark `--chart-*` tokens that repeated the light ones are gone.

Fixed:

- `Progress` draws its fill against `max`, clamps out-of-range values and
  treats NaN as indeterminate. `Meter` treats a NaN reading as the minimum.
- `Markdown` blocks protocol-relative links (`//host`, `/\host`), keeps GFM
  column alignment, and shows the alt text instead of a broken image when an
  image URL is unsafe.
- Form fields link their error text, and `FormTextField` its hint, to the
  control with `aria-describedby`. Date fields name the trigger "label,
  date", so the picked date is announced.
- The date picker popovers are named dialogs ("Choose date", "Choose dates",
  "Choose date and time") and focus the selected day, or today, on open.
  The calendar month and year dropdowns show a focus ring.
- `InfoTip` closes on the first Escape after opening on hover, no longer
  takes focus from a field when hover opens it, and names its panel from
  the title.
- An app-level `TooltipProvider` now sets the tooltip delay.
- `Combobox` opens from ArrowDown and ArrowUp, names its list and search
  field, and keeps options out of the Tab order (as does `SearchPicker`).
  Both announce "no results" in a status region and ignore Enter while an
  input method is composing text.
- `TableBodySkeleton` marks the body `aria-busy` and hides the placeholder
  rows from screen readers.
- Custom `PaginationPrevious` and `PaginationNext` text is the link's name.
- `BreadcrumbEllipsis` keeps its "More" name inside a menu trigger, and
  `BreadcrumbLink` shows the kit focus ring.
- `TabsNav` and `TabsList` scroll a newly active tab into view after a route
  change that keeps the layout mounted.
- `theme.css` stops kit animations and transitions under
  `prefers-reduced-motion`.
- `Switch` has the same enlarged hit area as `Checkbox`.
- Dark destructive buttons keep 4.5:1 text contrast on hover, and the
  unsorted table-header icon is no longer faded below 3:1.

## 0.10.0 - 2026-10-12

Minor: apps decide container and overlay sizes, and the pickers and
markdown field load their heavy parts on demand. These defaults change, so set a
width in app code where the old one is wanted:

- `DialogContent` no longer sets `sm:max-w-md`. Without a width class a
  dialog is the viewport minus 2rem wide; pass e.g. `className="sm:max-w-md"`.
- `PopoverContent` no longer sets `w-72`; it fits its content, clamped to the
  available viewport width. Pass e.g. `className="w-72"`.
- `DropdownMenuContent` no longer sets `min-w-40`; it fits its items.
- `TableBodySkeleton` bars fill their cell instead of stopping at 12rem.
- `TabsNav` no longer sets `w-full`. In a flex row it took the whole row
  and squeezed or wrapped the items beside it; now it sizes to its links,
  and a long row still shrinks and scrolls sideways. In normal block layout
  it still fills its container. Add `w-full` to `className` for the old fill.
- The `DateTimePickerButton` panel drops its 24rem cap; the calendar sets
  its width and the viewport clamps it.
- New: `InfoTip` `contentClassName`, and `Combobox` and `SearchPicker`
  `listClassName`, for the panel width and list height they used to fix.

On-demand loading (the public API is unchanged):

- `DatePickerButton`, `DateTimePickerButton`, and their `form/*` fields
  fetch the calendar (Day Picker) when the popover first opens, or earlier
  when the trigger is hovered or focused. A page that only shows the
  trigger downloads about 16 KB less (gzipped). A spinner fills the popover
  for the moment the calendar takes to arrive on a cold first open.
- `FormMarkdownField` fetches the Markdown renderer (react-markdown and
  remark-gfm) when Preview is first shown, hovered, or focused, so a form
  in Write mode downloads about 46 KB less (gzipped). The preview heading
  now renders after that load instead of synchronously.

## 0.9.4 - 2026-10-12

Patch: package internals only; the public API and rendered markup are
unchanged.

- `SearchPicker` resets its highlight while rendering instead of in an
  effect, so each keystroke commits once instead of twice.
- The `form/*` fields share one internal label, control, and error layout.
- `Combobox` and `SearchPicker` share option ids, the scroll-into-view
  ref, and the empty-row classes. `DatePickerButton` and
  `DateTimePickerButton` share their trigger and popover chrome.
- Tested against `radix-ui` 1.8.0 (the lockfile moves from 1.7.0; the
  `^1.4.3` range is unchanged).
- The branch coverage floor rises from 88% to 90%.

## 0.9.3 - 2026-10-12

Patch: optional creatable Combobox. Existing callers keep working with no
new props. Domain catalogs stay in the app.

- `Combobox` accepts `creatable` (default off). When the search is not
  already an option (value or label, case-insensitive), the listbox offers
  a create action (`Create "{value}"`, overridable with `createLabel`). It
  is a real `role="option"`: arrows, Home/End, PageUp/PageDown, and Enter
  work like selecting. Clicking or pressing Enter calls `onValueChange`
  with that value and closes the list.
- `normalizeCreateValue(query)` lets the app validate or reshape the query
  (trim is the default; return `null` to hide create). A currency picker
  can enforce `^[A-Z]{3}$` and uppercase without the kit knowing ISO 4217.
- A created value that is not yet in `options` still shows on the trigger
  so the app can append it to its own catalog after `onValueChange`.
- Storybook: Forms/Combobox Playground gains a `creatable` control, plus a
  Creatable story that demonstrates an app-side 3-letter code hook.
- `SearchPicker` caches normalized labels for the default accent-insensitive
  filter, reducing repeated work as users type through large lists.
- `Combobox` and `SearchPicker` share their listbox keyboard movement logic.
- The docs site publishes a machine-readable index of guide headings and
  package entry points.

## 0.9.2 - 2026-10-11

Patch: toast chrome only. The public API is unchanged.

- Right padding is `pr-6` (left stays `pl-4`) so title and description
  clear the floating close badge instead of sitting tight against the
  right edge. Icon-to-text gap is `gap-x-2.5` so the status icon and
  copy read as one unit.

## 0.9.1 - 2026-10-11

Patch: toast chrome only. The public API is unchanged.

- Close button is a circular badge (`rounded-full`, the allowed exception
  to square corners) centred on the toast's top-right corner (`-top-2
-right-2`, half outside the border): `bg-popover`, `border-border`, a
  light shadow, and a muted 12px X that tints to `text-foreground` on
  hover and focus. The hit area is 24px. Ghost sets no background, so
  Sonner's unlayered `[data-button]` default (`background: var(--normal-text)`)
  and the dark `[data-close-button]` rule (not gated on `data-styled`)
  were painting a solid foreground square and hiding the X. Important
  popover-fill utilities beat those fills. The toast does not reserve
  `pr-11` or clip the badge (`overflow-visible`), including in a stack.
- Width is content up to 356px, or the viewport minus gutters below that
  (390). Padding (`px-4 py-3`), title/description gap, and square corners
  match Alert.
- A plain `toast()` has no icon. `success`, `info`, `warning`, `error`, and
  `loading` stay distinguishable by a status icon plus tone on the icon,
  title, and border.

## 0.9.0 - 2026-10-11

Minor: optional feature libraries are peers, so an app that never imports
markdown, dates, toasts, or the theme wrapper does not install them.

- **Upgrade:** `react-markdown`, `remark-gfm`, `react-day-picker`,
  `date-fns`, `sonner`, and `next-themes` move from `dependencies` to
  optional `peerDependencies` (same version ranges). They stay in
  `devDependencies` for the kit's tests and Storybook. Core UI still
  ships `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`,
  `lucide-react`, and `tw-animate-css`. Install only the extras your
  entry points need; README and COMPONENTS.md have the exact `npm i`
  line. Apps that already depend on these packages keep working. The
  public API surface is unchanged.

## 0.8.2 - 2026-10-11

Patch so the `TabsNav` / `TabsList` row fits its scroller: `p-1` for the
active border and focus ring is part of the box, not extra overflow that
`overflow-y: hidden` was clipping. A stray vertical scrollbar no longer
appears if `overflow-y` is not hidden.

- The scroller height is the `h-11` list plus that padding (`h-13`; line
  variant is `h-14` with `pb-2`). `scrollHeight` equals `clientHeight` on
  the y axis even when `overflow-y` is `auto`.
- No API change. Trigger and link padding is unchanged.

## 0.8.1 - 2026-10-11

Patch so a long `TabsNav` / `TabsList` row scrolls inside itself instead of
growing a stray vertical scrollbar when an app adds `overflow-x-auto`.

- `TabsNav` and `TabsList` own overflow: `overflow-x-auto` with
  `overflow-y-hidden` (so CSS overflow pairing cannot turn the y axis to
  `auto`), padding for the active border and focus ring, a hidden
  horizontal scrollbar, and the same pinned edge-fade cue as `Table` in
  0.4.1+. The list fill covers the full row. The active tab or link
  scrolls into view on mount. The scroller joins the tab order while it
  overflows.
- Apps should drop `className="max-w-full overflow-x-auto"` on `TabsNav`
  (KairOS: `components/settings/settings-nav.tsx`) once they upgrade.
- Triggers and `TabsNav` links share one `px-4` and `flex-none`, so a long
  last label (Apple Reminders) is not squeezed. No last-child padding.

## 0.8.0 - 2026-10-11

Minor release with one breaking rename (allowed before 1.0): toasts get a
kit-owned API, so the library that draws them can change without app changes.

- **Breaking:** `atlas-react-kit/sonner` is now `atlas-react-kit/toast`.
  Change the import path; `Toaster` and `toast` keep their names, and the
  look is unchanged.
- `toast()` and `Toaster` take only the kit's own options and types:
  - `toast(message, options)`, `.success`, `.info`, `.warning`, `.error`, and
    `.loading` return the toast's id; `.dismiss(id?)` closes one or all.
  - Options are `id` (reuse it to replace a toast in place, e.g. loading →
    success), `description`, `duration`, and `action` / `cancel` as
    `{ label, onClick }`.
  - `Toaster` takes `position`, `closeButton` (default on), `expand`,
    `visibleToasts`, and `duration`.
  - Sonner's own props and options (`richColors`, `toastOptions`, class
    names, `unstyled`, `toast.promise`, `toast.custom`) are no longer part of
    the API, and are dropped if passed from plain JavaScript.
- The docs page is now Feedback/Toast; old Feedback/Sonner links redirect.

## 0.7.0 - 2026-10-10

Minor release: one toast setup for every app. No existing API was removed;
toasts look different (kit-styled, with a close button).

- `atlas-react-kit/sonner` exports `toast`. Import it from the kit instead
  of from `sonner`, and drop `sonner` from the app's own dependencies: an app
  with a second copy of Sonner sends toasts the kit's `Toaster` never sees.
- Toasts are drawn with kit classes (Sonner runs `unstyled`): the popover
  surface with square corners; success, warning, and error toasts color the
  icon, title, and border like `Alert`; action and cancel buttons are kit
  buttons on their own row; every toast has a labelled close button
  (`closeButton={false}` turns it off). `richColors` no longer changes the
  look. App `toastOptions.classNames` are merged with the kit's per part.

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
