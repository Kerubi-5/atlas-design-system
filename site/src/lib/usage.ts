import components from "../../../COMPONENTS.md?raw"

/**
 * Beta components, read from the **Beta** paragraph under COMPONENTS.md
 * "Status" and keyed like `usage` (`dropdown-menu` → `Dropdown menu`).
 */
const betaParagraph =
  /\*\*Beta\*\*[\s\S]*?:([\s\S]*?)\n\n/.exec(components)?.[1] ?? ""
export const beta = new Set(
  [...betaParagraph.matchAll(/`([a-z-]+)`/g)].map(([, subpath = ""]) => {
    const name = subpath.replaceAll("-", " ")
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
)
if (beta.size === 0) {
  throw new Error('COMPONENTS.md "Status" has no **Beta** list to read')
}

/**
 * "When to use" guidance shown on each component's docs page, keyed by the
 * component name in the story title (`Forms/Input` → `Input`). The build test fails when a component
 * story has no entry here.
 */
export const usage: Record<string, string> = {
  Accordion: `
**Use for** stacked sections people open one at a time: FAQs, grouped settings, long forms split into parts.

**Not for** navigation between views (use \`Tabs\`) or content everyone needs to see (keep it visible).

**Accessibility** Each trigger is a button with \`aria-expanded\`; keep trigger text short and descriptive.`,
  Alert: `
**Use for** a message about the page or a section that should stay visible: a failed save, a trial ending, a sync warning.

**Not for** brief confirmations (use [Toast](/docs/feedback-toast--docs)) or field errors (use [FieldError](/docs/forms-field--docs) under the field).

**Accessibility** Destructive alerts are \`role="alert"\` and are announced; others are \`role="status"\`. Write a short title and a description that says what to do next.`,
  Avatar: `
**Use for** a person or workspace next to their name: comment authors, assignees, account menus.

**Not for** decorative images or logos inside content.

**Accessibility** Give \`AvatarImage\` an \`alt\` unless the name is already shown next to it (then use \`alt=""\`). The fallback shows initials while the image loads or if it fails.`,
  Badge: `
**Use for** short status or category labels: Paid, Pending, Beta. Status chips take their variant and tone from [Tokens](./DESIGN_RULES.md#tokens).

**Not for** actions (use \`Button\`) or long text.

**Accessibility** Don't rely on color alone: the word carries the meaning.`,
  Breadcrumb: `
**Use for** showing where a page sits in a hierarchy of three or more levels, with links back up.

**Not for** step-by-step flows or a flat app with one level.

**Accessibility** The last item is \`BreadcrumbPage\` (plain text with \`aria-current="page"\`), not a link. Pass \`asChild\` to use your router's link.`,
  Button: `
**Use for** actions. \`default\` for the main action in an area, \`outline\` or \`ghost\` for secondary actions, \`destructive\` for deleting, \`link\` for an inline action that reads like a link.

**Not for** navigation to another page (use a link; \`asChild\` can style one as a button).

**Accessibility** Label with a verb ("Save order"). Name icon-only buttons as [Accessibility](./DESIGN_RULES.md#accessibility) says, and add a \`Tooltip\` for sighted users.`,
  Calendar: `
**Use for** an always-visible month grid, such as a scheduling sidebar.

**Not for** a form field (use [DatePickerButton](/docs/forms-date-picker--docs), which opens this calendar in a popover).

**Accessibility** Arrow keys move between days. Day names include the visible number ("Tuesday, October 27, 2026").`,
  Card: `
**Use for** grouping related content and actions into one surface. \`flush\` lets a table or list run edge to edge.

**Not for** every section of a page; too many cards turn a layout into boxes.

**Accessibility** Use a real heading inside when the card starts a section (\`CardTitle as="h1"\` or your own heading).`,
  Chart: `
**Use for** small SVG charts you draw yourself: \`chartFrame\` sets the plot box, \`ChartYAxisGrid\` the axis, \`useChartScrub\` the crosshair, and \`ChartTooltip\` / \`ChartLegend\` the readout.

**Not for** dashboards that need zoom, brushing, or many chart types (use a charting library).

**Accessibility** Give the \`<svg>\` \`role="img"\`, a summary \`aria-label\`, and \`tabIndex={0}\`; arrow keys step the crosshair and the tooltip is a live status.`,
  "Choice fields": `
**Use for** form choices with the kit's label, hint, and error timing: \`FormCheckboxField\` for one boolean, \`FormCheckboxGroupField\` for several values, \`FormToggleGroupField\` for one of a few, \`FormComboboxField\` for one of many.

**Not for** a choice that acts at once outside a form, such as a view filter (use \`ToggleGroup\` directly).

**Accessibility** Groups are named by their label or legend, and errors are read with the control.`,
  Checkbox: `
**Use for** on/off choices submitted with a form, and multi-select lists.

**Not for** a setting that applies immediately (use \`Switch\`) or one choice from several (use \`RadioGroup\`).

**Accessibility** Pair with a \`Label htmlFor\`; the label is part of the click target.`,
  Combobox: `
**Use for** picking one value from a long or searchable list: timezones, currencies, countries. Set \`creatable\` when the search can become a new option (for example a 3-letter currency code the catalog does not have yet). Domain lists and validation stay in the app (\`normalizeCreateValue\`). Creating calls \`onValueChange\` like a selection.

**Not for** short lists of a handful of options (use [Select](/docs/forms-select--docs)) or an always-visible filtered list (use [SearchPicker](/docs/forms-search-picker--docs)). Creatable is still a picker: it does not turn Combobox into a text field.

**Accessibility** Name it with \`Label htmlFor={id}\` or \`aria-label\`; a combobox does not take its name from the selected value. The create row is a listbox option (\`Create "PHP"\`); Enter selects it like any other option.`,
  "Color legend": `
**Use for** a key next to a color scale: map bins, status ramps. Pass CSS colors the app owns.

**Not for** attribution, licenses, or overlay positioning — those stay in the app (\`className\` for chrome).

**Accessibility** Name the figure with \`title\` or \`aria-label\`. Don't rely on the swatch color alone; every item has a text label.`,
  "Date picker": `
**Use for** a single date, or a from/to range with \`mode="range"\`, in a form. Set \`clearable\` when an empty value is a valid answer.

**Not for** dates people type faster than they click (birthdays years back may suit a text input).

**Accessibility** Label the trigger with \`Label htmlFor\`. Escape closes the popover and returns focus to the trigger.`,
  "Date time picker": `
**Use for** a local date and time in one field (appointments, scheduled sends).

**Not for** a date alone (use [DatePickerButton](/docs/forms-date-picker--docs)) or durations.

**Accessibility** Label the trigger with \`Label htmlFor\`; the time selects are labelled inside the popover.`,
  Dialog: `
**Use for** a short task or confirmation that needs focus before the user continues.

**Not for** messages that don't need a decision (use an [Alert](/docs/feedback-alert--docs) or [Toast](/docs/feedback-toast--docs)) or long, multi-page flows.

**Accessibility** Always include \`DialogTitle\`; focus is trapped inside and returns to the trigger on close. Name confirm buttons after the action ("Delete order").`,
  "Dropdown menu": `
**Use for** a list of commands behind a button: row actions, overflow menus, account menus.

**Not for** choosing a form value (use [Select](/docs/forms-select--docs) or [Combobox](/docs/forms-combobox--docs)) or site navigation.

**Accessibility** Opens with Enter, Space, or Arrow Down; arrows move between items; typing jumps to an item. Name icon-only triggers as [Accessibility](./DESIGN_RULES.md#accessibility) says.`,
  "Empty panel": `
**Use for** the space where a list, table, or widget will show content once there is some.

**Not for** errors (use [ErrorBoundary](/docs/feedback-error-boundary--docs) or an [Alert](/docs/feedback-alert--docs)) or loading (use [Skeleton](/docs/feedback-skeleton--docs)).

**Writing** Say what will appear and how to add the first item.`,
  "Error boundary": `
**Use for** wrapping a section that can fail independently so the rest of the page keeps working.

**Not for** expected empty or validation states.

**Accessibility** The fallback is \`role="alert"\` with Try again and Reload actions.`,
  Field: `
**Use for** laying out a label, control, description, and error as one field, vertically or side by side.

**Not for** a whole form's layout on its own; combine \`FieldGroup\` and \`FieldSet\`.

**Accessibility** Point \`FieldLabel htmlFor\` at the control and use \`FieldSet\` with \`FieldLegend\` for groups of checkboxes or radios.`,
  "Info tip": `
**Use for** longer help than a tooltip: a titled popover from a 20px glyph with a 44px hit area.

**Not for** a short label (use \`Tooltip\`) or a glossary / "coming soon" chip.

**Accessibility** \`label\` is required (\`aria-label\` on the icon button). Click, tap, and keyboard always toggle it.`,
  Input: `
**Use for** single-line text: names, emails, search terms, numbers.

**Not for** multi-line text (use [Textarea](/docs/forms-textarea--docs)) or picking from known options.

**Accessibility** Always pair with a visible \`Label\`; a placeholder is an example, not a label. Set \`aria-invalid\` with a field error.`,
  Label: `
**Use for** naming every form control. Beside checkboxes, radios, and switches it switches to sentence case automatically.

**Not for** headings or general text.

**Accessibility** Connect with \`htmlFor\` (or wrap the control) so clicking the label focuses the control.`,
  Kanban: `
**Use for** items that move through stages people drag between: a sales pipeline, a task board. Your store owns the items; \`onMove\` gets the drop's neighbour positions to save the order.

**Not for** a sortable list with one column (use a list or \`Table\`) or picking a single status (use \`Select\`).

**Accessibility** Cards drag by a labelled grip so the card body stays a normal button. The Card actions menu also moves, reorders, finishes, and removes cards without dragging. Each stop shows its own focus ring. Give the board an \`aria-label\`; scroll buttons appear when columns are off-screen.`,
  Markdown: `
**Use for** rendering GitHub-flavoured Markdown the app already stores as a string.

**Not for** a WYSIWYG editor. Pair with \`FormMarkdownField\` for write / preview.

**Accessibility** Links and images are sanitized (http, https, mailto, hash, and root paths only). Raw HTML is not rendered.`,
  Meter: `
**Use for** a current value against a scale, with optional ticks: spend vs a cap, pace vs typical.

**Not for** an unknown wait (use \`Spinner\`). The \`meter\` and \`progress\` rows in [Components](./COMPONENTS.md) say when to use \`Progress\` instead.

**Accessibility** It is \`role="meter"\` with \`aria-valuemin\`, \`aria-valuemax\`, and \`aria-valuenow\`. \`aria-label\` is required.`,
  "Nav link": `
**Use for** app-shell navigation: Calendar, Tasks, Settings. Pass \`active\` from the route; the kit has no router.

**Not for** a hierarchy trail (use \`Breadcrumb\`). [App shell navigation](./COMPONENTS.md#app-shell-navigation) says when to use \`TabsNav\` instead.

**Accessibility** The current item is \`aria-current="page"\`; \`isNavActive(pathname, href)\` decides it. Pass \`asChild\` to render a router link, or use \`next/nav-link\` in Next. Put the links in a labelled \`nav\`.`,
  "Page header": `
**Use for** the title row at the top of a page: the \`h1\`, a one-line hint, and page actions. Pair with \`PeriodStepper\` for dated pages and \`SkipLink\` in the app shell.

**Not for** section headings inside a page (use a heading or \`CardTitle as="h2"\`).

**Accessibility** One \`h1\` per page; the stepper's range is announced when it changes, and the skip link is the first thing a keyboard user reaches.`,
  Pagination: `
**Use for** moving through pages of a long list or table where the page belongs in the URL.

**Not for** short lists (show everything) or infinite feeds.

**Accessibility** The current page has \`aria-current="page"\`; previous and next links are labelled for screen readers.`,
  Popover: `
**Use for** small, non-blocking panels tied to a trigger: filters, quick settings, extra detail.

**Not for** tasks that need a decision (use \`Dialog\`) or a list of commands (use \`DropdownMenu\`).

**Accessibility** Opens from a button; Escape closes it and returns focus to the trigger.`,
  Progress: `
**Use for** a job with a known percentage: uploads, imports, multi-step processing.

**Not for** unknown durations (use \`Spinner\`). The \`meter\` and \`progress\` rows in [Components](./COMPONENTS.md) say when to use \`Meter\` instead.

**Accessibility** Name it with \`aria-label\` or \`aria-labelledby\` and show the percentage as text.`,
  "Radio group": `
**Use for** one choice from two to about five options that should all be visible.

**Not for** long lists (use \`Select\` or \`Combobox\`) or independent on/off choices (use \`Checkbox\`).

**Accessibility** Name the group (\`aria-label\` or a \`FieldLegend\`); arrow keys move the selection.`,
  "Search picker": `
**Use for** picking one item from a list that stays on the page: places, directories, long filters.

**Not for** a compact popover picker (use [Combobox](/docs/forms-combobox--docs)) or a short fixed list (use [Select](/docs/forms-select--docs)).

**Accessibility** The input is \`role="combobox"\` with an always-visible listbox. Arrows, Home, End, PageUp, PageDown, Enter, and Escape move and select.`,
  Select: `
**Use for** one value from a short, fixed list.

**Not for** long or searchable lists (use [Combobox](/docs/forms-combobox--docs)) or commands (use [DropdownMenu](/docs/actions-dropdown-menu--docs)).

**Accessibility** Label the trigger with \`Label htmlFor\`; typing a letter jumps to matching options.`,
  Separator: `
**Use for** a hairline between groups of content or toolbar sections.

**Not for** spacing alone (use gap or margin).

**Accessibility** Decorative by default; pass \`decorative={false}\` when it separates meaningful sections for screen readers.`,
  Slider: `
**Use for** choosing a number on a continuous scale: probability, volume, a threshold.

**Not for** a read-only fill (use \`Meter\` or \`Progress\`).

**Accessibility** Pair with a visible \`Label\` and \`aria-labelledby\` (the thumb is not a labelable element). The thumb has a 44px hit area; arrows, Home, and End move it.`,
  Skeleton: `
**Use for** placeholders shaped like the content that is loading. The fill is \`bg-skeleton\` (about Tailwind gray-200 in light mode), not muted chrome and not the input-boundary token.

**Not for** unknown layouts (use [Spinner](/docs/feedback-spinner--docs)) or empty results (use [EmptyPanel](/docs/feedback-empty-panel--docs)).

**Accessibility** Mark the loading region \`aria-busy\` and announce completion when it matters.`,
  Toast: `
**Use for** brief confirmations after an action: "Settings saved", "Order archived".

**Not for** errors the user must fix or anything they need to read later (use an [Alert](/docs/feedback-alert--docs)).

**Writing** Past tense and short.

**Setup** The \`toast\` row in [Components](./COMPONENTS.md) shows how to mount \`Toaster\` and call \`toast()\`.`,
  "Stat tile": `
**Use for** a labelled figure in a summary strip: spent, remaining, a count. Optional children hold a \`Meter\`.

**Not for** a whole dashboard card (use \`Card\`) or a heading alone (\`sectionLabel\` is the shared uppercase class).

**Accessibility** The value is visible text. Name any nested meter yourself.`,
  Spinner: `
**Use for** short waits with an unknown duration, inside a button or a small region.

**Not for** page loads with a known layout (use \`Skeleton\`) or jobs with a percentage (use \`Progress\`).

**Accessibility** Announced as "Loading" by default; pass a more specific \`aria-label\` such as "Saving".`,
  Switch: `
**Use for** a setting that takes effect immediately: notifications, dark mode, feature flags.

**Not for** choices submitted with a form (use \`Checkbox\`).

**Accessibility** Pair with a \`Label htmlFor\`; it is a \`role="switch"\` with \`aria-checked\`.`,
  Table: `
**Use for** data people compare across rows and columns. Pair with \`SortableTableHead\`, \`TableBodySkeleton\`, and \`EmptyPanel\`.

**Not for** layout, or lists with one meaningful column (use a list).

**Accessibility** Wide tables scroll inside themselves and join the tab order while they overflow, so keyboard users can scroll.`,
  Tabs: `
**Use for** switching between panels of related content on one page.

**Not for** navigation: [App shell navigation](./COMPONENTS.md#app-shell-navigation) says when to use \`TabsNav\` or \`NavLink\`.

**Accessibility** Arrow keys move between tabs; every \`TabsTrigger\` needs a matching \`TabsContent\`. A long row scrolls horizontally inside \`TabsList\` / \`TabsNav\` (no vertical scrollbar) and joins the tab order while it overflows, like \`Table\`.`,
  Textarea: `
**Use for** multi-line text: notes, descriptions, messages. It grows with its content.

**Not for** single values (use [Input](/docs/forms-input--docs)).

**Accessibility** Pair with a visible \`Label\`; set \`aria-invalid\` with a field error.`,
  "Theme provider": `
**Use for** light, dark, and system themes at the app root.

**Not for** per-component theming; tokens already switch with the theme.

**Accessibility** Respect the system preference by default (\`defaultTheme="system"\`). Read [Theme](./COMPONENTS.md#theme) before turning on the \`d\` shortcut.`,
  "Toggle group": `
**Use for** a small set of pressed/unpressed options shown together, such as view modes (List, Board).

**Not for** form values submitted later (use \`RadioGroup\` or \`Checkbox\`) or navigation (use \`Tabs\` or \`TabsNav\`).

**Accessibility** Name icon-only items as [Accessibility](./DESIGN_RULES.md#accessibility) says; arrow keys move between items. The selected item uses the same wash, \`text-selected-foreground\`, and \`border-selected-foreground\` as a pressed \`Toggle\`, including in single (radio) mode.`,
  Toggle: `
**Use for** a single pressed/unpressed control, such as Bold in a toolbar.

**Not for** settings (use \`Switch\`).

**Accessibility** Exposes \`aria-pressed\` and \`data-state=on\`; name icon-only toggles as [Accessibility](./DESIGN_RULES.md#accessibility) says. The pressed look is the selected wash plus a \`selected-foreground\` border.`,
  Tooltip: `
**Use for** short labels on icon-only buttons and hints for truncated text.

**Not for** essential information or anything interactive (use visible text or a \`Popover\`).

**Accessibility** Opens on hover and keyboard focus. It helps sighted users but does not name the button; name icon buttons as [Accessibility](./DESIGN_RULES.md#accessibility) says.`,
}
