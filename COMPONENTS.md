# Component guide

Import each module from `@kerubi/atlas-ui/<subpath>`. Primitives preserve the
underlying element or Radix props, including `className`, alongside their options.
Form helpers and `TableBodySkeleton` accept only their documented props. There is
no root component barrel.

| Subpath                      | Main exports and options                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `button`                     | `Button`, `buttonVariants`; `variant`, `size`, `asChild`                                                                           |
| `badge`                      | `Badge`, `badgeVariants`; `variant`, `tone`, `asChild`                                                                             |
| `calendar`                   | `Calendar`, `CalendarDayButton`; React Day Picker props and `buttonVariant`                                                        |
| `card`                       | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`; `Card` supports `flush`           |
| `checkbox`                   | `Checkbox`                                                                                                                         |
| `dialog`                     | `Dialog`, trigger, portal, overlay, content, close, header, footer, title, description; `DialogContent` supports `showCloseButton` |
| `empty-panel`                | `EmptyPanel`; required `children`; optional `size`, `muted`, `className`                                                           |
| `field`                      | Field, label, legend, description, group, set, title, content, separator, error; `Field` supports `orientation`                    |
| `input`, `textarea`, `label` | `Input`, `Textarea`, `Label`                                                                                                       |
| `popover`                    | `Popover`, trigger, anchor, content, header, title, description                                                                    |
| `select`                     | Select, trigger, value, content, group, label, item, separator, scroll buttons; trigger `size`                                     |
| `separator`, `skeleton`      | `Separator`, `Skeleton`                                                                                                            |
| `sonner`                     | `Toaster`; Sonner props, with `next-themes` theme defaults                                                                         |
| `table`                      | Table, header, body, footer, row, head, cell, caption                                                                              |
| `table-body-skeleton`        | `TableBodySkeleton`; `columns`, optional `rows` (default 5)                                                                        |
| `tabs`                       | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `TabsNav`, `tabsListVariants`; list `variant` is `default` or `line`             |
| `toggle`                     | `Toggle`, `toggleVariants`; `variant`, `size`                                                                                      |
| `toggle-group`               | `ToggleGroup`, `ToggleGroupItem`; `variant`, `size`                                                                                |
| `form/text-field`            | `FormTextField`, type `TextFieldApi`; controlled field, label, multiline, description, input constraints                           |
| `form/select-field`          | `FormSelectField`; `value`, `onValueChange`, `label`, optional `meta` and placeholder; select item children                        |
| `form/field-error`           | `FieldError`, `getFieldErrorMessage`; types `FieldErrorMessage`, `FieldMetaState`                                                  |
| `form/feedback-field`        | `FormFeedbackField`; nullable `message`                                                                                            |
| `next/tabs-nav-link`         | `TabsNavLink`; Next Link props and required `active` boolean; requires Next.js 16                                                  |
| `utils`                      | `cn`, `onInputChange`                                                                                                              |
| `theme.css`                  | Tailwind 4 theme; installation in [README](./README.md)                                                                            |

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
error text and invalid styling. `FormSelectField` accepts the same error meta
shape. `FieldError` accepts either `message` or pre-resolved `text`.

## URL navigation in Next.js

```tsx
import { TabsNav } from "@kerubi/atlas-ui/tabs"
import { TabsNavLink } from "@kerubi/atlas-ui/next/tabs-nav-link"

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
