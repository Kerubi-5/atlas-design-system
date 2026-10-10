/**
 * Beta components (see COMPONENTS.md "Status"), keyed like `usage`. The build
 * test keeps this list and COMPONENTS.md in sync.
 */
export const beta = new Set([
  "Accordion",
  "Alert",
  "Avatar",
  "Breadcrumb",
  "Date time picker",
  "Dropdown menu",
  "Pagination",
  "Progress",
  "Radio group",
  "Spinner",
  "Switch",
  "Tooltip",
])

/**
 * "When to use" guidance shown on each component's docs page, keyed by the
 * story title after `Components/`. The build test fails when a component
 * story has no entry here.
 */
export const usage: Record<string, string> = {
  Accordion: `
**Use for** stacked sections people open one at a time: FAQs, grouped settings, long forms split into parts.

**Not for** navigation between views (use \`Tabs\`) or content everyone needs to see (keep it visible).

**Accessibility** Each trigger is a button with \`aria-expanded\`; keep trigger text short and descriptive.`,
  Alert: `
**Use for** a message about the page or a section that should stay visible: a failed save, a trial ending, a sync warning.

**Not for** brief confirmations (use a toast) or field errors (use \`FieldError\` under the field).

**Accessibility** Destructive alerts are \`role="alert"\` and are announced; others are \`role="status"\`. Write a short title and a description that says what to do next.`,
  Avatar: `
**Use for** a person or workspace next to their name: comment authors, assignees, account menus.

**Not for** decorative images or logos inside content.

**Accessibility** Give \`AvatarImage\` an \`alt\` unless the name is already shown next to it (then use \`alt=""\`). The fallback shows initials while the image loads or if it fails.`,
  Badge: `
**Use for** short status or category labels: Paid, Pending, Beta. Use \`variant="soft"\` with a \`tone\` for status.

**Not for** actions (use \`Button\`) or long text.

**Accessibility** Don't rely on color alone: the word carries the meaning. Every soft tone meets AA in both themes.`,
  Breadcrumb: `
**Use for** showing where a page sits in a hierarchy of three or more levels, with links back up.

**Not for** step-by-step flows or a flat app with one level.

**Accessibility** The last item is \`BreadcrumbPage\` (plain text with \`aria-current="page"\`), not a link. Pass \`asChild\` to use your router's link.`,
  Button: `
**Use for** actions. \`default\` for the main action in an area, \`outline\` or \`ghost\` for secondary actions, \`destructive\` for deleting, \`link\` for an inline action that reads like a link.

**Not for** navigation to another page (use a link; \`asChild\` can style one as a button).

**Accessibility** Label with a verb ("Save order"). Icon-only buttons need \`aria-label\`; add a \`Tooltip\` for sighted users.`,
  Calendar: `
**Use for** an always-visible month grid, such as a scheduling sidebar.

**Not for** a form field (use \`DatePickerButton\`, which opens this calendar in a popover).

**Accessibility** Arrow keys move between days. Day names include the visible number ("Tuesday, October 27, 2026").`,
  Card: `
**Use for** grouping related content and actions into one surface. \`flush\` lets a table or list run edge to edge.

**Not for** every section of a page; too many cards turn a layout into boxes.

**Accessibility** Use a real heading inside when the card starts a section (\`CardTitle as="h1"\` or your own heading).`,
  Checkbox: `
**Use for** on/off choices submitted with a form, and multi-select lists.

**Not for** a setting that applies immediately (use \`Switch\`) or one choice from several (use \`RadioGroup\`).

**Accessibility** Pair with a \`Label htmlFor\`; the label is part of the click target.`,
  Combobox: `
**Use for** picking one value from a long or searchable list: timezones, currencies, countries.

**Not for** short lists of a handful of options (use \`Select\`) or free text entry.

**Accessibility** Name it with \`Label htmlFor={id}\` or \`aria-label\`; a combobox does not take its name from the selected value.`,
  "Date picker": `
**Use for** a single date, or a from/to range with \`mode="range"\`, in a form.

**Not for** dates people type faster than they click (birthdays years back may suit a text input).

**Accessibility** Label the trigger with \`Label htmlFor\`. Escape closes the popover and returns focus to the trigger.`,
  "Date time picker": `
**Use for** a local date and time in one field (appointments, scheduled sends).

**Not for** a date alone (use \`DatePickerButton\`) or durations.

**Accessibility** Label the trigger with \`Label htmlFor\`; the time selects are labelled inside the popover.`,
  Dialog: `
**Use for** a short task or confirmation that needs focus before the user continues.

**Not for** messages that don't need a decision (use an \`Alert\` or toast) or long, multi-page flows.

**Accessibility** Always include \`DialogTitle\`; focus is trapped inside and returns to the trigger on close. Name confirm buttons after the action ("Delete order").`,
  "Dropdown menu": `
**Use for** a list of commands behind a button: row actions, overflow menus, account menus.

**Not for** choosing a form value (use \`Select\` or \`Combobox\`) or site navigation.

**Accessibility** Opens with Enter, Space, or Arrow Down; arrows move between items; typing jumps to an item. Icon-only triggers need \`aria-label\`.`,
  "Empty panel": `
**Use for** the space where a list, table, or widget will show content once there is some.

**Not for** errors (use \`ErrorBoundary\` or an \`Alert\`) or loading (use \`Skeleton\`).

**Writing** Say what will appear and how to add the first item.`,
  "Error boundary": `
**Use for** wrapping a section that can fail independently so the rest of the page keeps working.

**Not for** expected empty or validation states.

**Accessibility** The fallback is \`role="alert"\` with Try again and Reload actions.`,
  Field: `
**Use for** laying out a label, control, description, and error as one field, vertically or side by side.

**Not for** a whole form's layout on its own; combine \`FieldGroup\` and \`FieldSet\`.

**Accessibility** Point \`FieldLabel htmlFor\` at the control and use \`FieldSet\` with \`FieldLegend\` for groups of checkboxes or radios.`,
  Input: `
**Use for** single-line text: names, emails, search terms, numbers.

**Not for** multi-line text (use \`Textarea\`) or picking from known options.

**Accessibility** Always pair with a visible \`Label\`; a placeholder is an example, not a label. Set \`aria-invalid\` with a field error.`,
  Label: `
**Use for** naming every form control. Beside checkboxes, radios, and switches it switches to sentence case automatically.

**Not for** headings or general text.

**Accessibility** Connect with \`htmlFor\` (or wrap the control) so clicking the label focuses the control.`,
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

**Not for** unknown durations (use \`Spinner\`) or scores and meters.

**Accessibility** Name it with \`aria-label\` or \`aria-labelledby\` and show the percentage as text.`,
  "Radio group": `
**Use for** one choice from two to about five options that should all be visible.

**Not for** long lists (use \`Select\` or \`Combobox\`) or independent on/off choices (use \`Checkbox\`).

**Accessibility** Name the group (\`aria-label\` or a \`FieldLegend\`); arrow keys move the selection.`,
  Select: `
**Use for** one value from a short, fixed list.

**Not for** long or searchable lists (use \`Combobox\`) or commands (use \`DropdownMenu\`).

**Accessibility** Label the trigger with \`Label htmlFor\`; typing a letter jumps to matching options.`,
  Separator: `
**Use for** a hairline between groups of content or toolbar sections.

**Not for** spacing alone (use gap or margin).

**Accessibility** Decorative by default; pass \`decorative={false}\` when it separates meaningful sections for screen readers.`,
  Skeleton: `
**Use for** placeholders shaped like the content that is loading.

**Not for** unknown layouts (use \`Spinner\`) or empty results (use \`EmptyPanel\`).

**Accessibility** Mark the loading region \`aria-busy\` and announce completion when it matters.`,
  Sonner: `
**Use for** brief confirmations after an action: "Settings saved", "Order archived".

**Not for** errors the user must fix or anything they need to read later (use an \`Alert\`).

**Writing** Past tense and short. Mount one \`Toaster\` near the app root and call \`toast()\` from \`sonner\`.`,
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

**Not for** navigation that changes the URL (use \`TabsNav\` with links).

**Accessibility** Arrow keys move between tabs; every \`TabsTrigger\` needs a matching \`TabsContent\`.`,
  Textarea: `
**Use for** multi-line text: notes, descriptions, messages. It grows with its content.

**Not for** single values (use \`Input\`).

**Accessibility** Pair with a visible \`Label\`; set \`aria-invalid\` with a field error.`,
  "Theme provider": `
**Use for** light, dark, and system themes at the app root. The \`d\` shortcut toggles the theme outside text fields and typeahead widgets.

**Not for** per-component theming; tokens already switch with the theme.

**Accessibility** Respect the system preference by default (\`defaultTheme="system"\`); turn off the shortcut with \`enableShortcut={false}\` if it clashes with app shortcuts.`,
  "Toggle group": `
**Use for** a small set of pressed/unpressed options shown together, such as view modes (List, Board).

**Not for** form values submitted later (use \`RadioGroup\` or \`Checkbox\`) or navigation (use \`Tabs\` or \`TabsNav\`).

**Accessibility** Give icon-only items \`aria-label\`; arrow keys move between items.`,
  Toggle: `
**Use for** a single pressed/unpressed control, such as Bold in a toolbar.

**Not for** settings (use \`Switch\`).

**Accessibility** Exposes \`aria-pressed\`; icon-only toggles need \`aria-label\`.`,
  Tooltip: `
**Use for** short labels on icon-only buttons and hints for truncated text.

**Not for** essential information or anything interactive (use visible text or a \`Popover\`).

**Accessibility** Opens on hover and keyboard focus. Keep \`aria-label\` on icon buttons; the tooltip helps sighted users.`,
}
