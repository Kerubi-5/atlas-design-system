---
name: atlas-react-kit
description: Build and change React UI with the atlas-react-kit design system (Atlas) instead of hand-rolled markup or another UI library. Use this whenever the project depends on atlas-react-kit (check package.json) and the task touches UI, such as pages, forms, inputs, pickers, selects, dialogs, tables, cards, tabs, badges, toasts, empty or loading states, theming, or dark mode, even if the user never says "Atlas" or "design system". Also use it when the user mentions Atlas components, design tokens, or making UI match the kit.
---

# Atlas React Kit

atlas-react-kit is a shared React 19 + Tailwind 4 component library with a fixed
look: square corners, semantic color tokens, uppercase tracked headings, and a
purple "selected" wash for active states. Apps compose its components; they do
not restyle or fork them. Following that keeps every app consistent and makes
kit upgrades a version bump instead of a merge.

## 1. Read the docs for the installed version

The package ships its own guides, versioned with the code. Read both before
writing UI, because props and rules change between releases and your memory of
a previous version may be wrong:

```sh
KIT=$(dirname "$(node -p "require.resolve('atlas-react-kit/package.json')")")
cat "$KIT/DESIGN_RULES.md" "$KIT/COMPONENTS.md"
```

`COMPONENTS.md` lists every import subpath and its props. When a prop is not
listed there, check the type declarations in `$KIT/dist/<subpath>.d.ts` rather
than guessing.

## 2. Check the project setup once

Components render unstyled unless the app's global stylesheet imports the theme
and tells Tailwind to scan the kit's compiled files:

```css
@import "tailwindcss";
@import "atlas-react-kit/theme.css";
@source "../node_modules/atlas-react-kit/dist"; /* relative to this CSS file */
```

Dark mode needs `ThemeProvider` from `atlas-react-kit/theme-provider` near the
root (or a `dark` class on an ancestor). Toasts need one `<Toaster />` from
`atlas-react-kit/sonner`; call `toast()` from the `sonner` package, which the
app should list as its own dependency. Fix missing setup rather than working
around unstyled components.

## 3. Pick the kit component for the job

Import each component from its subpath, e.g.
`import { Button } from "atlas-react-kit/button"`. There is no root barrel, and
`dist/` or `internal/` paths are not public API.

| Need                                            | Use                                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Short fixed list (a handful of options)         | `Select` family from `select`                                                                       |
| Long or searchable list (timezones, currencies) | `Combobox` from `combobox` with `{ value, label }[]` options                                        |
| One date, or a from/to range                    | `DatePickerButton` from `date-picker` (`mode="range"` for ranges)                                   |
| Date and time (not `datetime-local`)            | `DateTimePickerButton` from `date-time-picker`                                                      |
| Labelled field with error text                  | `FormTextField`, `FormSelectField`, `FormDatePickerField`, `FormDateTimePickerField` from `form/*`  |
| Form-level error (save failed)                  | `FormFeedbackField` from `form/feedback-field`                                                      |
| Content panels on one page                      | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `tabs`                                        |
| View switch that changes the URL                | `TabsNav` with links: `TabsNavLink` from `next/tabs-nav-link` in Next, else `tabsTriggerVariants()` |
| Status chip (paid, pending, failed)             | `Badge variant="soft"` (`success`, `warning`, `neutral` tones); `variant="destructive"` for failed  |
| Data table                                      | `Table` family from `table`; `SortableTableHead`; `TableBodySkeleton` while loading                 |
| Nothing to show yet                             | `EmptyPanel` from `empty-panel`                                                                     |
| Grouped content                                 | `Card` family from `card`; `<Card flush>` for an edge-to-edge table or list                         |
| Modal                                           | `Dialog` family from `dialog`                                                                       |
| Label for an icon button, or a short hint       | `Tooltip` from `tooltip`; keep `aria-label` on icon buttons                                         |
| Row actions or an overflow menu of commands     | `DropdownMenu` family from `dropdown-menu`                                                          |
| Setting that applies immediately                | `Switch` from `switch`; `Checkbox` for choices submitted with a form                                |
| One choice from a few visible options           | `RadioGroup` and `RadioGroupItem` from `radio-group`                                                |
| Inline message about a page or section          | `Alert` from `alert` (`success`, `warning`, `destructive` variants)                                 |
| Person or workspace image                       | `Avatar`, `AvatarImage`, `AvatarFallback` from `avatar`                                             |
| Sections that expand in place                   | `Accordion` family from `accordion`                                                                 |
| Pages of a long list                            | `Pagination` family from `pagination`                                                               |
| Where the page sits in a hierarchy              | `Breadcrumb` family from `breadcrumb`                                                               |
| Work in progress                                | `Progress` from `progress` when the percent is known, else `Spinner` from `spinner`                 |
| Crash recovery around a section                 | `ErrorBoundary` from `error-boundary`                                                               |
| Conditional classes                             | `cn` from `utils`                                                                                   |

If nothing fits, build the piece in the app from kit primitives and semantic
tokens. Do not copy kit source into the app; a missing shared component belongs
in the atlas-design-system repository.

Existing app code may predate the kit (raw colors, rounded boxes, hand-styled
buttons). Don't copy that style into new UI. Move what the task touches onto kit
components and tokens, and mention the rest to the user instead of rewriting
files the task doesn't need.

## 4. Style with tokens, not values

These rules are what make Atlas look like Atlas. `DESIGN_RULES.md` has the full
list; the ones that come up most:

- **Semantic colors only**: `bg-primary`, `text-muted-foreground`,
  `border-border`, `bg-card`, `text-destructive`. Raw palette classes
  (`bg-purple-600`, `text-gray-500`) and paired `dark:` colors drift from the
  theme; tokens already switch with light and dark.
- **Selected and active state**: `bg-selected text-selected-foreground` for the
  current nav item, chip, row, or toggle. Grey fills read as hover, not
  selection.
- **Status**: `success`, `warning`, and `destructive` for good, caution, and
  bad. Use them as text or soft tints (the `Badge` tones). The destructive tint
  is too low-contrast in light mode, so show bad states as plain destructive
  text (`Badge variant="destructive"`) rather than overriding a soft badge's
  colors. There is no foreground token for text on a solid status fill, so
  avoid that combination too.
- **Square corners**: primitives have none. Use `rounded-full` only for real
  circles (avatars, dots). Adding `rounded-md` to a card or button breaks the
  system.
- **Don't restyle kit controls**: `Input`, `SelectTrigger`, `DatePickerButton`,
  `DateTimePickerButton`, and `Combobox` share 40px form-control chrome.
  Overriding their height, padding, or border makes one field look different
  from its neighbors.
- **Layout overrides**: `CardContent className="px-0"` makes one section flush
  without `!important`. Tables already scroll horizontally inside cards, so do
  not wrap them in another overflow container.
- **Headings**: `CardTitle` and `DialogTitle` already apply the uppercase,
  tracked heading style; use `font-heading` for other headings.

## 5. Check before you finish

Run these over the files you changed and fix what they find (an app's own
brand colors, kept outside kit components, are the only expected hits):

```sh
# Raw palette colors instead of tokens
grep -nE '\b(bg|text|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b' <files>
# Rounded corners on primitives
grep -nE '\brounded-(sm|md|lg|xl|2xl|3xl)\b' <files>
# Non-public imports
grep -nE "from ['\"]atlas-react-kit(/dist|/internal|['\"])" <files>
```

Then typecheck: wrong prop names usually mean the component was guessed rather
than read from `COMPONENTS.md` or the `.d.ts`.
