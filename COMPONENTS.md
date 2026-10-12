# Component guide

Import each module from `atlas-react-kit/<subpath>`. Primitives preserve the
underlying element or Radix props, including `className`, alongside their options.
Form helpers and `TableBodySkeleton` accept only their documented props. There is
no root component barrel.

For installation, see [README.md](./README.md); for styling and accessibility,
see [DESIGN_RULES.md](./DESIGN_RULES.md).

For LLM-assisted implementation of patterns this kit does not export, use
[COSS UI](https://coss.com/ui) as a reference before building a component from
scratch. Its Base UI catalog includes input groups, number fields, OTP fields,
drawers, and segmented controls. COSS is a separate library; its components
are not Atlas exports.

## Optional peer dependencies

Core entries need only the kit. These feature entries need an extra install
(same version ranges as the kit's optional peers). `Toaster` also reads the
theme from `next-themes`, so toast consumers install that too.

| Entry points                                                                                           | Extra install                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `calendar`, `date-picker`, `date-time-picker`, `form/date-picker-field`, `form/date-time-picker-field` | `npm i react-day-picker@^10.0.1 date-fns@^4.4.0` |
| `markdown`, `form/markdown-field`                                                                      | `npm i react-markdown@^10.1.0 remark-gfm@^4.0.1` |
| `theme-provider`                                                                                       | `npm i next-themes@^0.4.6`                       |
| `toast`                                                                                                | `npm i sonner@^2.0.7 next-themes@^0.4.6`         |
| `next/tabs-nav-link`                                                                                   | `npm i next@^16.0.0`                             |

| Subpath                       | Main exports and options                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accordion`                   | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`; Radix `type` `single` (with `collapsible`) or `multiple`                                                                                                                                                                                                                                                           |
| `alert`                       | `Alert`, `AlertTitle`, `AlertDescription`, `alertVariants`; `variant` `default`, `success`, `warning`, `destructive`; tone on title and icon, body stays muted; destructive is `role="alert"`                                                                                                                                                                                            |
| `avatar`                      | `Avatar`, `AvatarImage`, `AvatarFallback`; `size` `sm`, `default`, `lg`; round by design                                                                                                                                                                                                                                                                                                 |
| `breadcrumb`                  | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink` (`asChild` for router links), `BreadcrumbPage` (`aria-current`), `BreadcrumbSeparator`, `BreadcrumbEllipsis`                                                                                                                                                                                                          |
| `button`                      | `Button`, `buttonVariants`, `quietButtonInteraction`; `variant`, `size`, `asChild`; outline/ghost hover is brand purple + selected wash, not muted grey                                                                                                                                                                                                                                  |
| `badge`                       | `Badge`, `badgeVariants`; `variant`, `tone`, `asChild`                                                                                                                                                                                                                                                                                                                                   |
| `calendar`                    | `Calendar`, `CalendarDayButton`; React Day Picker props and `buttonVariant`                                                                                                                                                                                                                                                                                                              |
| `card`                        | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`; `Card` supports `flush`; `CardTitle as="h2"` (up to `h4`) makes it a section heading; root uses `min-h-min shrink-0` so flex columns do not collapse it, and `min-w-0` so nested tables scroll; `CardContent className="px-0"` overrides padding without `!`                            |
| `checkbox`                    | `Checkbox`                                                                                                                                                                                                                                                                                                                                                                               |
| `color-legend`                | `ColorLegend`; `title`, `items` as `{ color, range?, label }[]`, optional `caption`, `children`, `aria-label`, `className` (overlay chrome). No attribution.                                                                                                                                                                                                                             |
| `combobox`                    | `Combobox`; `options` as `{ value, label }[]`, `value`, `onValueChange`; optional placeholder, search, empty text, `creatable`, `normalizeCreateValue` (query → value or `null`), `createLabel`; trigger matches Input/SelectTrigger chrome; keyboard highlight scrolls into view; create is a listbox option selected with Enter                                                        |
| `date-picker`                 | `DatePickerButton`, `toDate`, `formatLocalDate`, `DateRange`; `mode` `"single"` (default) or `"range"`; single `value` is `Date` or `yyyy-MM-dd`; range `value` is `{ from, to }`; trigger matches Input chrome; optional `numberOfMonths` (range default 1 below `md`, 2 at `md+`), `side`, `aria-labelledby`, and `aria-describedby`                                                   |
| `date-time-picker`            | `DateTimePickerButton`, `resolveTimeStep`, `DEFAULT_TIME_STEP`; controlled `value` is `Date` or `null`; `onChange` emits `Date \                                                                                                                                                                                                                                                         |
| `dialog`                      | `Dialog`, trigger, portal, overlay, content, close, header, footer, title, description; `DialogContent` supports `showCloseButton`                                                                                                                                                                                                                                                       |
| `dropdown-menu`               | `DropdownMenu` family (trigger, content, item, checkbox/radio items, label, separator, shortcut, sub menus); item `variant="destructive"` and `inset`; for commands, not values                                                                                                                                                                                                          |
| `empty-panel`                 | `EmptyPanel`; required `children`; optional `size`, `muted`, `className`                                                                                                                                                                                                                                                                                                                 |
| `error-boundary`              | `ErrorBoundary`, `ErrorFallback`; optional `message`; retry resets, reload refreshes the page                                                                                                                                                                                                                                                                                            |
| `field`                       | Field, label, legend, description, group, set, title, content, separator, error; `Field` supports `orientation`                                                                                                                                                                                                                                                                          |
| `info-tip`                    | `InfoTip`, `InlineTip`; required `label` (aria-label); `title`, `description`, `children`, `layout` `box` \| `inline`, `side`, `align`, `badge`, `icon`, `className`. Popover, 20px glyph, 44px hit. Hover opens only on a fine pointer. Not a Tooltip.                                                                                                                                  |
| `input`, `textarea`, `label`  | `Input`, `Textarea`, `Label`                                                                                                                                                                                                                                                                                                                                                             |
| `markdown`                    | `Markdown`, `MarkdownContent`; `content`, optional `className`. GFM via `react-markdown` + `remark-gfm` in this subpath only. Sanitized (no raw HTML; http/https/mailto/#/`/` URLs). Token styles, no typography plugin.                                                                                                                                                                 |
| `meter`                       | `Meter`; `value`, `max`, optional `min` (default 0), `fillClassName`, `markers` as `{ position, className? }[]`, required `aria-label`, `className`. `role="meter"`. Not `Progress`.                                                                                                                                                                                                     |
| `pagination`                  | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink` (`isActive` sets `aria-current`, the selected wash, and a selected border; `disabled` drops the `href` for a page that does not exist, such as Previous on page 1), `PaginationPrevious`, `PaginationNext` (custom text becomes the link name), `PaginationEllipsis`                                               |
| `popover`                     | `Popover`, trigger, anchor, content, header, title, description                                                                                                                                                                                                                                                                                                                          |
| `progress`                    | `Progress`; Radix props, `value` 0–100; label it with `aria-label` or `aria-labelledby`. For a value against a scale with ticks, use `Meter`.                                                                                                                                                                                                                                            |
| `radio-group`                 | `RadioGroup`, `RadioGroupItem`; short visible lists; arrow keys move the selection; round dots                                                                                                                                                                                                                                                                                           |
| `search-picker`               | `SearchPicker<T>`; always-visible combobox + listbox; `items`, `getValue`, `getLabel`, optional `filter` (default casefold + accent-fold includes), `value`, `onSelect`, `label`, `placeholder`, `emptyText`, `listLabel`, `disabled`, `className`. Arrows, Home/End, PageUp/PageDown, Enter, Escape.                                                                                    |
| `select`                      | Select, trigger, value, content, group, label, item, separator, scroll buttons; trigger `size`; trigger text is `text-base md:text-sm` like Input                                                                                                                                                                                                                                        |
| `separator`, `skeleton`       | `Separator`, `Skeleton`                                                                                                                                                                                                                                                                                                                                                                  |
| `slider`                      | `Slider`; `value` number, `onValueChange`, optional `onValueCommit`, `min`, `max`, `step`, `disabled`, `id`, `aria-labelledby`, `className`. Radix Slider; 44px thumb hit; square track; primary fill. Name it with `aria-labelledby`.                                                                                                                                                   |
| `sortable-table-head`         | `SortableTableHead`; `sorted`, `direction` (`asc` \                                                                                                                                                                                                                                                                                                                                      |
| `spinner`                     | `Spinner`; `role="status"` with `aria-label` (default `Loading`)                                                                                                                                                                                                                                                                                                                         |
| `stat-tile`                   | `StatTile`, `statTileGrid`, `sectionLabel`; `label`, `value`, optional `sub`, `children`, `className`.                                                                                                                                                                                                                                                                                   |
| `switch`                      | `Switch`; settings that apply immediately; square track and thumb                                                                                                                                                                                                                                                                                                                        |
| `table`                       | Table, header, body, footer, row, head, cell, caption; root scroller is `min-w-0 overflow-x-auto` with a fade cue; cells are `px-2` below `sm`                                                                                                                                                                                                                                           |
| `table-body-skeleton`         | `TableBodySkeleton`; `columns`, optional `rows` (default 5)                                                                                                                                                                                                                                                                                                                              |
| `tabs`                        | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `TabsNav`, `tabsListVariants`, `tabsTriggerVariants`; list `variant` is `default` or `line`; style `TabsNav` links with `tabsTriggerVariants()`; `TabsNav` / `TabsList` scroll horizontally only (`overflow-y` hidden, `p-1` counted in the scroller height, edge fade, active item into view) — do not wrap them in `overflow-x-auto` |
| `toast`                       | `Toaster`, `toast`; mount one `Toaster` (`position`, `closeButton` (default on), `expand`, `visibleToasts`, `duration`), then `toast(message, options)`, `.success`, `.info`, `.warning`, `.error`, `.loading`, `.dismiss(id?)`. Options: `id` (replaces that toast), `description`, `duration`, `action` / `cancel` as `{ label, onClick }`. Kit-owned API: no toast library is exposed |
| `toggle`                      | `Toggle`, `toggleVariants`, `selectedToggleChrome`; `variant`, `size`. Pressed state is the selected wash, text, and border via `data-state=on`, `aria-pressed`, and `aria-checked`                                                                                                                                                                                                      |
| `toggle-group`                | `ToggleGroup`, `ToggleGroupItem`; `variant`, `size`. Items share `toggleVariants`, so single (radio) and multiple selections match a pressed `Toggle`                                                                                                                                                                                                                                    |
| `theme-provider`              | `ThemeProvider`, `useTheme`; optional `storageKey` (default `atlas-theme`), `enableShortcut` for the `d` toggle                                                                                                                                                                                                                                                                          |
| `tooltip`                     | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`; opens on hover and focus; short labels only                                                                                                                                                                                                                                                                            |
| `form/markdown-field`         | `FormMarkdownField`; `field` is `TextFieldApi`; `label`, optional `id`, `placeholder`, `rows`, `showError`. Write / preview; preview uses `Markdown`.                                                                                                                                                                                                                                    |
| `form/text-field`             | `FormTextField`, type `TextFieldApi`; controlled field, label, multiline, description, input constraints                                                                                                                                                                                                                                                                                 |
| `form/select-field`           | `FormSelectField`; `value`, `onValueChange`, `label`, optional `meta` and placeholder; select item children                                                                                                                                                                                                                                                                              |
| `form/date-picker-field`      | `FormDatePickerField`; `value`, `onValueChange`, `label`, optional `meta`, placeholder, and `className` (forwarded to the trigger)                                                                                                                                                                                                                                                       |
| `form/date-time-picker-field` | `FormDateTimePickerField`; `value` is `Date` or `null`; `onValueChange` emits `Date \                                                                                                                                                                                                                                                                                                    |
| `form/field-error`            | `FieldError` (optional `id`), `getFieldErrorMessage`; types `FieldErrorMessage`, `FieldMetaState`                                                                                                                                                                                                                                                                                        |
| `form/feedback-field`         | `FormFeedbackField`; nullable `message`                                                                                                                                                                                                                                                                                                                                                  |
| `next/tabs-nav-link`          | `TabsNavLink`; Next Link props and required `active` boolean; requires Next.js 16                                                                                                                                                                                                                                                                                                        |
| `utils`                       | `cn`, `onInputChange`                                                                                                                                                                                                                                                                                                                                                                    |
| `theme.css`                   | Tailwind 4 theme; installation in [README](./README.md)                                                                                                                                                                                                                                                                                                                                  |

## Status

Components are **stable** unless listed here. Stable components change
through the deprecation policy in
[CONTRIBUTING.md](https://github.com/Kerubi-5/atlas-design-system/blob/main/CONTRIBUTING.md):
a deprecation notice first, removal in a later minor release.

**Beta** components may still change shape in a minor release; the
changelog calls out every change: `accordion`, `alert`, `avatar`,
`breadcrumb`, `color-legend`, `date-time-picker`, `dropdown-menu`, `info-tip`,
`markdown`, `meter`, `pagination`, `progress`, `radio-group`, `search-picker`,
`slider`, `spinner`, `stat-tile`, `switch`, `tooltip`.

## Forms

`TextFieldApi` is a structural interface, with no form library dependency:

```ts
type TextFieldApi = {
  name: string
  state: {
    value: string
    meta: { errors: (string | { message?: string } | undefined)[] }
  }
  handleChange: (value: string) => void
  handleBlur: () => void
}
```

`FormTextField` accepts `field` and `label`; use `multiline` and `rows` for a
textarea, `inputType` for a specific input, and `showError={false}` to suppress
error text and invalid styling. `FormMarkdownField` uses the same `field` shape
for a Write / Preview GFM body. `FormSelectField`, `FormDatePickerField`, and
`FormDateTimePickerField` accept the same error meta shape.
`FormDatePickerField` takes a `Date` or `yyyy-MM-dd` string and calls
`onValueChange` with `Date | undefined`. `FormDateTimePickerField` takes a
`Date` or `null` and calls `onValueChange` with `Date | null`. `FieldError`
accepts either `message` or pre-resolved `text`, and an `id` to point the
control's `aria-describedby` at. Every `form/*` field does that for you: the
error text (and `FormTextField`'s `description`) is the control's accessible
description. The date fields label their trigger with `aria-labelledby` (the
label, then the trigger) rather than `<label for>`, so the picked date is
part of its name.

`DatePickerButton` is single-day by default. For a from/to range, set
`mode="range"`; `value` is `{ from, to }` (each side `Date` or `yyyy-MM-dd`)
and `onChange` receives `DateRange | undefined`. The trigger uses the same
form-control chrome as `Input` and `SelectTrigger`. The range popover shows
one month below `md` and two months at `md+` unless `numberOfMonths` is set,
clamps to the viewport with collision padding and scroll, stays `w-auto` so
it does not collapse to the default popover width, and includes a Clear
action. Pass `side` to prefer a placement; Radix still flips on collision.
The popover is a dialog named "Choose date" ("Choose dates" in range mode),
and focus moves to the selected day, or today, when it opens. Pass
`aria-labelledby` and `aria-describedby` to name and describe the trigger;
to keep the date in its name, list the label's id and then `${id}-value`,
the trigger text's id (a `<label for>` alone names the button by the label
only).
`FormDatePickerField` forwards `className` to that trigger.

`DateTimePickerButton` is the date-and-time control. `value` is a `Date` or
`null`; `onChange` receives `Date | null`. The trigger matches the same
form-control chrome. The popover is one month, a labelled Hour and Minute
pair (24-hour, stepped by `timeStep`, default 15), and Clear. Picking a day
keeps the popover open so the time can be set; the time selects stay
disabled until a day is chosen. The panel is `w-auto`, sized by the
calendar, and clamped to the viewport so it stays on-screen at 390px. Pass
`side` to prefer a placement. Like `DatePickerButton`, the popover is a
named dialog ("Choose date and time") that focuses the selected day or
today, and the trigger takes `aria-labelledby` and `aria-describedby`. `FormDateTimePickerField` forwards `className`
and `timeStep` to that control.

Outline and ghost `Button` hover uses `border-selected-foreground`,
`text-selected-foreground`, and `bg-selected`; keyboard focus adds the shared
solid `ring-ring`. They do not use a muted grey fill, including when the
control sits on a selected row (for example "Clear selection").

```tsx
import { DateTimePickerButton } from "atlas-react-kit/date-time-picker"

export function EventStarts({
  value,
  onChange,
}: {
  value: Date | null
  onChange: (date: Date | null) => void
}) {
  return (
    <DateTimePickerButton
      value={value}
      onChange={onChange}
      timeStep={15}
      placeholder="Pick a date and time"
    />
  )
}
```

```tsx
import { DatePickerButton, type DateRange } from "atlas-react-kit/date-picker"

export function ExportRange({
  value,
  onChange,
}: {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}) {
  return (
    <DatePickerButton
      mode="range"
      value={value}
      onChange={onChange}
      numberOfMonths={2}
      placeholder="Export range"
    />
  )
}
```

## Theme

```tsx
import { ThemeProvider } from "atlas-react-kit/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider storageKey="app-theme" enableShortcut>
      {children}
    </ThemeProvider>
  )
}
```

`ThemeProvider` is a client component and does not import Next.js. It stores the
choice under `atlas-theme` unless `storageKey` is set. The `d` dark/light toggle
is off by default; pass `enableShortcut` to turn it on, and give people a setting
to turn it off again, since a single-key shortcut can fire by accident (WCAG 2.1.4).

## URL navigation in Next.js

```tsx
import { TabsNav } from "atlas-react-kit/tabs"
import { TabsNavLink } from "atlas-react-kit/next/tabs-nav-link"

export function ViewSwitcher({ view }: { view: string }) {
  return (
    <TabsNav aria-label="Items view">
      <TabsNavLink href="?view=list" active={view === "list"}>
        List
      </TabsNavLink>
      <TabsNavLink href="?view=board" active={view === "board"}>
        Board
      </TabsNavLink>
    </TabsNav>
  )
}
```

Outside Next, compose `TabsNav` with your own links: style each one with
`tabsTriggerVariants()` and set `data-state="active"` plus `aria-current="page"`
on the active link.

```tsx
import { TabsNav, tabsTriggerVariants } from "atlas-react-kit/tabs"

export function ViewSwitcher({ view }: { view: string }) {
  return (
    <TabsNav aria-label="Items view">
      {["list", "board"].map((item) => (
        <a
          key={item}
          href={`?view=${item}`}
          data-state={view === item ? "active" : "inactive"}
          aria-current={view === item ? "page" : undefined}
          className={tabsTriggerVariants()}
        >
          {item}
        </a>
      ))}
    </TabsNav>
  )
}
```

Hook-driven controls and form handlers declare their client boundary; presentational
modules such as `button`, `badge`, `card`, and `skeleton` can be composed from
React Server Components. Pass interactive callbacks from client components.
