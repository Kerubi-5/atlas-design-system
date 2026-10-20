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

Components render unstyled unless the app's global stylesheet imports the
theme and tells Tailwind to scan the kit's compiled files. Compare the app
with the setup in the package's README (the stylesheet lines and dark mode):

```sh
cat "$KIT/README.md"
```

Toasts need one `<Toaster />` from `atlas-react-kit/toast`; show them with
`toast()` from the same module, using only the options it declares. Never
import a toast library such as `sonner` directly: the kit owns the toast API,
and a second copy never reaches its toaster. Some entry points need optional
peers; install the extras from the "Optional peer dependencies" table in
`COMPONENTS.md` when you import them. Fix missing setup rather than working
around unstyled components.

## 3. Pick the kit component for the job

Import each component from its subpath, e.g.
`import { Button } from "atlas-react-kit/button"`. There is no root barrel, and
`dist/` or `internal/` paths are not public API.

| Need                                                       | Use                                                                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Short fixed list (a handful of options)                    | `Select` from `select`                                                                                                  |
| Long or searchable list (timezones, currencies)            | `Combobox` from `combobox`                                                                                              |
| Always-visible searchable list (places)                    | `SearchPicker` from `search-picker`                                                                                     |
| One date, or a from/to range                               | `DatePickerButton` from `date-picker`                                                                                   |
| Date and time (not `datetime-local`)                       | `DateTimePickerButton` from `date-time-picker`                                                                          |
| Labelled field with error text                             | `FormTextField`, `FormSelectField`, `FormDatePickerField`, `FormDateTimePickerField`, `FormMarkdownField` from `form/*` |
| Checkbox, checkbox group, toggle group, combobox in a form | `FormCheckboxField`, `FormCheckboxGroupField`, `FormToggleGroupField`, `FormComboboxField` from `form/*`                |
| Custom control the kit has no form field for               | `FormControlField` from `form/control-field`                                                                            |
| Form-level error (save failed)                             | `FormFeedbackField` from `form/feedback-field`                                                                          |
| Focus the first invalid field when a submit fails          | `focusFirstInvalid` from `form/focus-first-invalid`                                                                     |
| Content panels on one page                                 | `Tabs` from `tabs`                                                                                                      |
| View switch that changes the URL                           | `TabsNav` and `TabsNavLink` from `tabs`; in Next, `next/tabs-nav-link`                                                  |
| App shell nav (Calendar, Tasks, Settings)                  | `NavLink` from `nav-link`; in Next, `next/nav-link`                                                                     |
| Skip-to-content link                                       | `SkipLink` from `skip-link`                                                                                             |
| Page title row with actions                                | `PageHeader` from `page-header`                                                                                         |
| Previous / today / next period                             | `PeriodStepper` from `period-stepper`; for URL periods in Next, `next/period-stepper`                                   |
| Cards in columns that drag                                 | `KanbanBoard` from `kanban`                                                                                             |
| SVG chart axes, grid, tooltip, legend                      | `chartFrame` and the other helpers from `chart`                                                                         |
| Status chip (paid, pending, failed)                        | `Badge` from `badge`                                                                                                    |
| Data table                                                 | `Table` from `table`                                                                                                    |
| Sortable column header                                     | `SortableTableHead` from `sortable-table-head`                                                                          |
| Table body while loading                                   | `TableBodySkeleton` from `table-body-skeleton`                                                                          |
| Nothing to show yet                                        | `EmptyPanel` from `empty-panel`                                                                                         |
| Grouped content                                            | `Card` from `card`                                                                                                      |
| Modal                                                      | `Dialog` from `dialog`                                                                                                  |
| Label for an icon button, or a short hint                  | `Tooltip` from `tooltip`                                                                                                |
| Longer help from a glyph                                   | `InfoTip` from `info-tip`                                                                                               |
| Color scale key                                            | `ColorLegend` from `color-legend`                                                                                       |
| GitHub-flavoured Markdown                                  | `Markdown` from `markdown`                                                                                              |
| Summary figure in a strip                                  | `StatTile` from `stat-tile`                                                                                             |
| Value against a scale, optional ticks                      | `Meter` from `meter`                                                                                                    |
| Number on a continuous scale                               | `Slider` from `slider`                                                                                                  |
| Row actions or an overflow menu of commands                | `DropdownMenu` from `dropdown-menu`                                                                                     |
| Setting that applies immediately                           | `Switch` from `switch`                                                                                                  |
| On/off choice submitted with a form                        | `Checkbox` from `checkbox`                                                                                              |
| One choice from a few visible options                      | `RadioGroup` from `radio-group`                                                                                         |
| Inline message about a page or section                     | `Alert` from `alert`                                                                                                    |
| Person or workspace image                                  | `Avatar` from `avatar`                                                                                                  |
| Sections that expand in place                              | `Accordion` from `accordion`                                                                                            |
| Pages of a long list                                       | `Pagination` from `pagination`                                                                                          |
| Where the page sits in a hierarchy                         | `Breadcrumb` from `breadcrumb`                                                                                          |
| Job with a known percentage                                | `Progress` from `progress`                                                                                              |
| Wait of unknown length                                     | `Spinner` from `spinner`                                                                                                |
| Crash recovery around a section                            | `ErrorBoundary` from `error-boundary`                                                                                   |
| Conditional classes                                        | `cn` from `utils`                                                                                                       |

The parts, props, and options of each are in its `COMPONENTS.md` row.

If nothing fits, build the piece in the app from kit primitives and semantic
tokens. Do not copy kit source into the app; a missing shared component belongs
in the atlas-design-system repository.

Existing app code may predate the kit (raw colors, rounded boxes, hand-styled
buttons). Don't copy that style into new UI. Move what the task touches onto kit
components and tokens, and mention the rest to the user instead of rewriting
files the task doesn't need.

## 4. Follow the design rules

Use semantic tokens and the shipped component APIs. Avoid raw palette color
classes and rounded corners on square primitives; do not restyle kit controls.
For accessibility, copy, selection, status, and layout details, follow the
matching sections in `DESIGN_RULES.md`; it is the source of truth.

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
