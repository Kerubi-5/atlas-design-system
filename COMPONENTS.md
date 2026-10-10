# Component guide

Import each module from `atlas-react-kit/<subpath>`. Primitives preserve the
underlying element or Radix props, including `className`, alongside their options.
Form helpers and `TableBodySkeleton` accept only their documented props. There is
no root component barrel.

| Subpath                       | Main exports and options                                                                                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `accordion`                   | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`; Radix `type` `single` (with `collapsible`) or `multiple`                                                                                                                                                                   |
| `alert`                       | `Alert`, `AlertTitle`, `AlertDescription`, `alertVariants`; `variant` `default`, `success`, `warning`, `destructive`; tone on title and icon, body stays muted; destructive is `role="alert"`                                                                                                    |
| `avatar`                      | `Avatar`, `AvatarImage`, `AvatarFallback`; `size` `sm`, `default`, `lg`; round by design                                                                                                                                                                                                         |
| `breadcrumb`                  | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink` (`asChild` for router links), `BreadcrumbPage` (`aria-current`), `BreadcrumbSeparator`, `BreadcrumbEllipsis`                                                                                                                  |
| `button`                      | `Button`, `buttonVariants`, `quietButtonInteraction`; `variant`, `size`, `asChild`; outline/ghost hover is brand purple + selected wash, not muted grey                                                                                                                                          |
| `badge`                       | `Badge`, `badgeVariants`; `variant`, `tone`, `asChild`                                                                                                                                                                                                                                           |
| `calendar`                    | `Calendar`, `CalendarDayButton`; React Day Picker props and `buttonVariant`                                                                                                                                                                                                                      |
| `card`                        | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`; `Card` supports `flush`; root uses `min-h-min shrink-0` so flex columns do not collapse it, and `min-w-0` so nested tables scroll; `CardContent className="px-0"` overrides padding without `!` |
| `checkbox`                    | `Checkbox`                                                                                                                                                                                                                                                                                       |
| `combobox`                    | `Combobox`; `options` as `{ value, label }[]`, `value`, `onValueChange`; optional placeholder, search, empty text; trigger matches Input/SelectTrigger chrome; keyboard highlight scrolls into view                                                                                              |
| `date-picker`                 | `DatePickerButton`, `toDate`, `formatLocalDate`, `DateRange`; `mode` `"single"` (default) or `"range"`; single `value` is `Date` or `yyyy-MM-dd`; range `value` is `{ from, to }`; trigger matches Input chrome; optional `numberOfMonths` (range default 1 below `md`, 2 at `md+`) and `side`   |
| `date-time-picker`            | `DateTimePickerButton`, `resolveTimeStep`, `DEFAULT_TIME_STEP`; controlled `value` is `Date` or `null`; `onChange` emits `Date \                                                                                                                                                                 |
| `dialog`                      | `Dialog`, trigger, portal, overlay, content, close, header, footer, title, description; `DialogContent` supports `showCloseButton`                                                                                                                                                               |
| `dropdown-menu`               | `DropdownMenu` family (trigger, content, item, checkbox/radio items, label, separator, shortcut, sub menus); item `variant="destructive"` and `inset`; for commands, not values                                                                                                                  |
| `empty-panel`                 | `EmptyPanel`; required `children`; optional `size`, `muted`, `className`                                                                                                                                                                                                                         |
| `error-boundary`              | `ErrorBoundary`, `ErrorFallback`; optional `message`; retry resets, reload refreshes the page                                                                                                                                                                                                    |
| `field`                       | Field, label, legend, description, group, set, title, content, separator, error; `Field` supports `orientation`                                                                                                                                                                                  |
| `input`, `textarea`, `label`  | `Input`, `Textarea`, `Label`                                                                                                                                                                                                                                                                     |
| `pagination`                  | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink` (`isActive` sets `aria-current`, the selected wash, and a selected border), `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`                                                                                   |
| `popover`                     | `Popover`, trigger, anchor, content, header, title, description                                                                                                                                                                                                                                  |
| `progress`                    | `Progress`; Radix props, `value` 0–100; label it with `aria-label` or `aria-labelledby`                                                                                                                                                                                                          |
| `radio-group`                 | `RadioGroup`, `RadioGroupItem`; short visible lists; arrow keys move the selection; round dots                                                                                                                                                                                                   |
| `select`                      | Select, trigger, value, content, group, label, item, separator, scroll buttons; trigger `size`; trigger text is `text-base md:text-sm` like Input                                                                                                                                                |
| `separator`, `skeleton`       | `Separator`, `Skeleton`                                                                                                                                                                                                                                                                          |
| `sortable-table-head`         | `SortableTableHead`; `sorted`, `direction` (`asc` \                                                                                                                                                                                                                                              |
| `sonner`                      | `Toaster`; Sonner props, with `next-themes` theme defaults                                                                                                                                                                                                                                       |
| `spinner`                     | `Spinner`; `role="status"` with `aria-label` (default `Loading`)                                                                                                                                                                                                                                 |
| `switch`                      | `Switch`; settings that apply immediately; square track and thumb                                                                                                                                                                                                                                |
| `table`                       | Table, header, body, footer, row, head, cell, caption; root scroller is `min-w-0 overflow-x-auto` with a fade cue; cells are `px-2` below `sm`                                                                                                                                                   |
| `table-body-skeleton`         | `TableBodySkeleton`; `columns`, optional `rows` (default 5)                                                                                                                                                                                                                                      |
| `tabs`                        | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `TabsNav`, `tabsListVariants`, `tabsTriggerVariants`; list `variant` is `default` or `line`; style `TabsNav` links with `tabsTriggerVariants()`                                                                                                |
| `toggle`                      | `Toggle`, `toggleVariants`; `variant`, `size`                                                                                                                                                                                                                                                    |
| `toggle-group`                | `ToggleGroup`, `ToggleGroupItem`; `variant`, `size`                                                                                                                                                                                                                                              |
| `theme-provider`              | `ThemeProvider`, `useTheme`; optional `storageKey` (default `atlas-theme`), `enableShortcut` for the `d` toggle                                                                                                                                                                                  |
| `tooltip`                     | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`; opens on hover and focus; short labels only                                                                                                                                                                                    |
| `form/text-field`             | `FormTextField`, type `TextFieldApi`; controlled field, label, multiline, description, input constraints                                                                                                                                                                                         |
| `form/select-field`           | `FormSelectField`; `value`, `onValueChange`, `label`, optional `meta` and placeholder; select item children                                                                                                                                                                                      |
| `form/date-picker-field`      | `FormDatePickerField`; `value`, `onValueChange`, `label`, optional `meta`, placeholder, and `className` (forwarded to the trigger)                                                                                                                                                               |
| `form/date-time-picker-field` | `FormDateTimePickerField`; `value` is `Date` or `null`; `onValueChange` emits `Date \                                                                                                                                                                                                            |
| `form/field-error`            | `FieldError`, `getFieldErrorMessage`; types `FieldErrorMessage`, `FieldMetaState`                                                                                                                                                                                                                |
| `form/feedback-field`         | `FormFeedbackField`; nullable `message`                                                                                                                                                                                                                                                          |
| `next/tabs-nav-link`          | `TabsNavLink`; Next Link props and required `active` boolean; requires Next.js 16                                                                                                                                                                                                                |
| `utils`                       | `cn`, `onInputChange`                                                                                                                                                                                                                                                                            |
| `theme.css`                   | Tailwind 4 theme; installation in [README](./README.md)                                                                                                                                                                                                                                          |

## Status

Components are **stable** unless listed here. Stable components change
through the deprecation policy in
[CONTRIBUTING.md](https://github.com/Kerubi-5/atlas-design-system/blob/main/CONTRIBUTING.md):
a deprecation notice first, removal in a later minor release.

**Beta** components may still change shape in a minor release; the
changelog calls out every change: `accordion`, `alert`, `avatar`,
`breadcrumb`, `date-time-picker`, `dropdown-menu`, `pagination`, `progress`,
`radio-group`, `spinner`, `switch`, `tooltip`.

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
error text and invalid styling. `FormSelectField`, `FormDatePickerField`, and
`FormDateTimePickerField` accept the same error meta shape.
`FormDatePickerField` takes a `Date` or `yyyy-MM-dd` string and calls
`onValueChange` with `Date | undefined`. `FormDateTimePickerField` takes a
`Date` or `null` and calls `onValueChange` with `Date | null`. `FieldError`
accepts either `message` or pre-resolved `text`.

`DatePickerButton` is single-day by default. For a from/to range, set
`mode="range"`; `value` is `{ from, to }` (each side `Date` or `yyyy-MM-dd`)
and `onChange` receives `DateRange | undefined`. The trigger uses the same
form-control chrome as `Input` and `SelectTrigger`. The range popover shows
one month below `md` and two months at `md+` unless `numberOfMonths` is set,
clamps to the viewport with collision padding and scroll, stays `w-auto` so
it does not collapse to the default popover width, and includes a Clear
action. Pass `side` to prefer a placement; Radix still flips on collision.
`FormDatePickerField` forwards `className` to that trigger.

`DateTimePickerButton` is the date-and-time control. `value` is a `Date` or
`null`; `onChange` receives `Date | null`. The trigger matches the same
form-control chrome. The popover is one month, a labelled Hour and Minute
pair (24-hour, stepped by `timeStep`, default 15), and Clear. Picking a day
keeps the popover open so the time can be set; the time selects stay
disabled until a day is chosen. The panel is `w-auto`, viewport-clamped, and
capped at `min(100vw - 2rem, 24rem)` so it stays on-screen at 390px. Pass
`side` to prefer a placement. `FormDateTimePickerField` forwards `className`
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
choice under `atlas-theme` unless `storageKey` is set. Pass `enableShortcut={false}`
to disable the `d` dark/light toggle.

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
