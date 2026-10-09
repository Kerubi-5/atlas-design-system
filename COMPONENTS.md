# Component guide

Import each module from `atlas-react-kit/<subpath>`. Primitives preserve the
underlying element or Radix props, including `className`, alongside their options.
Form helpers and `TableBodySkeleton` accept only their documented props. There is
no root component barrel.

| Subpath                      | Main exports and options                                                                                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `button`                     | `Button`, `buttonVariants`, `quietButtonInteraction`; `variant`, `size`, `asChild`; outline/ghost hover is brand purple + selected wash, not muted grey                                                                                                                                          |
| `badge`                      | `Badge`, `badgeVariants`; `variant`, `tone`, `asChild`                                                                                                                                                                                                                                           |
| `calendar`                   | `Calendar`, `CalendarDayButton`; React Day Picker props and `buttonVariant`                                                                                                                                                                                                                      |
| `card`                       | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`; `Card` supports `flush`; root uses `min-h-min shrink-0` so flex columns do not collapse it, and `min-w-0` so nested tables scroll; `CardContent className="px-0"` overrides padding without `!` |
| `checkbox`                   | `Checkbox`                                                                                                                                                                                                                                                                                       |
| `combobox`                   | `Combobox`; `options` as `{ value, label }[]`, `value`, `onValueChange`; optional placeholder, search, empty text; trigger matches Input/SelectTrigger chrome; keyboard highlight scrolls into view                                                                                              |
| `date-picker`                | `DatePickerButton`, `toDate`, `formatLocalDate`, `DateRange`; `mode` `"single"` (default) or `"range"`; single `value` is `Date` or `yyyy-MM-dd`; range `value` is `{ from, to }`; trigger matches Input chrome; optional `numberOfMonths` (range default 1 below `md`, 2 at `md+`) and `side`   |
| `dialog`                     | `Dialog`, trigger, portal, overlay, content, close, header, footer, title, description; `DialogContent` supports `showCloseButton`                                                                                                                                                               |
| `empty-panel`                | `EmptyPanel`; required `children`; optional `size`, `muted`, `className`                                                                                                                                                                                                                         |
| `error-boundary`             | `ErrorBoundary`, `ErrorFallback`; optional `message`; retry resets, reload refreshes the page                                                                                                                                                                                                    |
| `field`                      | Field, label, legend, description, group, set, title, content, separator, error; `Field` supports `orientation`                                                                                                                                                                                  |
| `input`, `textarea`, `label` | `Input`, `Textarea`, `Label`                                                                                                                                                                                                                                                                     |
| `popover`                    | `Popover`, trigger, anchor, content, header, title, description                                                                                                                                                                                                                                  |
| `select`                     | Select, trigger, value, content, group, label, item, separator, scroll buttons; trigger `size`; trigger text is `text-base md:text-sm` like Input                                                                                                                                                |
| `separator`, `skeleton`      | `Separator`, `Skeleton`                                                                                                                                                                                                                                                                          |
| `sortable-table-head`        | `SortableTableHead`; `sorted`, `direction` (`asc` \| `desc`), `onClick`; sets `aria-sort`                                                                                                                                                                                                        |
| `sonner`                     | `Toaster`; Sonner props, with `next-themes` theme defaults                                                                                                                                                                                                                                       |
| `table`                      | Table, header, body, footer, row, head, cell, caption; root scroller is `min-w-0 overflow-x-auto` with a fade cue; cells are `px-2` below `sm`                                                                                                                                                   |
| `table-body-skeleton`        | `TableBodySkeleton`; `columns`, optional `rows` (default 5)                                                                                                                                                                                                                                      |
| `tabs`                       | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `TabsNav`, `tabsListVariants`; list `variant` is `default` or `line`                                                                                                                                                                           |
| `toggle`                     | `Toggle`, `toggleVariants`; `variant`, `size`                                                                                                                                                                                                                                                    |
| `toggle-group`               | `ToggleGroup`, `ToggleGroupItem`; `variant`, `size`                                                                                                                                                                                                                                              |
| `theme-provider`             | `ThemeProvider`, `useTheme`; optional `storageKey` (default `atlas-theme`), `enableShortcut` for the `d` toggle                                                                                                                                                                                  |
| `form/text-field`            | `FormTextField`, type `TextFieldApi`; controlled field, label, multiline, description, input constraints                                                                                                                                                                                         |
| `form/select-field`          | `FormSelectField`; `value`, `onValueChange`, `label`, optional `meta` and placeholder; select item children                                                                                                                                                                                      |
| `form/date-picker-field`     | `FormDatePickerField`; `value`, `onValueChange`, `label`, optional `meta`, placeholder, and `className` (forwarded to the trigger)                                                                                                                                                               |
| `form/field-error`           | `FieldError`, `getFieldErrorMessage`; types `FieldErrorMessage`, `FieldMetaState`                                                                                                                                                                                                                |
| `form/feedback-field`        | `FormFeedbackField`; nullable `message`                                                                                                                                                                                                                                                          |
| `next/tabs-nav-link`         | `TabsNavLink`; Next Link props and required `active` boolean; requires Next.js 16                                                                                                                                                                                                                |
| `utils`                      | `cn`, `onInputChange`                                                                                                                                                                                                                                                                            |
| `theme.css`                  | Tailwind 4 theme; installation in [README](./README.md)                                                                                                                                                                                                                                          |

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
error text and invalid styling. `FormSelectField` and `FormDatePickerField`
accept the same error meta shape. `FormDatePickerField` takes a `Date` or
`yyyy-MM-dd` string and calls `onValueChange` with `Date | undefined`.
`FieldError` accepts either `message` or pre-resolved `text`.

`DatePickerButton` is single-day by default. For a from/to range, set
`mode="range"`; `value` is `{ from, to }` (each side `Date` or `yyyy-MM-dd`)
and `onChange` receives `DateRange | undefined`. The trigger uses the same
form-control chrome as `Input` and `SelectTrigger`. The range popover shows
one month below `md` and two months at `md+` unless `numberOfMonths` is set,
clamps to the viewport with collision padding and scroll, stays `w-auto` so
it does not collapse to the default popover width, and includes a Clear
action. Pass `side` to prefer a placement; Radix still flips on collision.
`FormDatePickerField` forwards `className` to that trigger.

Outline and ghost `Button` hover and focus use `border-primary`,
`text-primary`, and `bg-selected`. They do not use a muted grey fill, including
when the control sits on a selected row (for example "Clear selection").

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

Outside Next, compose `TabsNav` with your own links and active-page semantics.
Hook-driven controls and form handlers declare their client boundary; presentational
modules such as `button`, `badge`, `card`, and `skeleton` can be composed from
React Server Components. Pass interactive callbacks from client components.
