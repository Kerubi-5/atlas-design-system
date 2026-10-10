# Design rules

Atlas owns these shared rules, its theme, and component implementations. Change
them here and release a package version. Build application-specific UI by composing
the shipped components.

## Tokens

Use semantic colors, radii, and fonts: `bg-primary`, `text-muted-foreground`,
`border-border`, and `font-heading`. Avoid raw palette classes and separate
light/dark color pairs; tokens already switch with the theme.

Selected or active navigation, tabs, toggles, chips, rows, and labels use
`bg-selected text-selected-foreground`. Outline and ghost buttons hover and
focus with `border-primary text-primary` and the selected wash, not a muted
grey fill. Table row hover can stay `hover:bg-muted`. The shipped controls
apply this distinction.

Use `success`, `warning`, and `destructive` for good, caution, and bad states.
For tinted status chips, use `Badge variant="soft" tone="success"` or
`tone="warning"`. The destructive tone has a known contrast limitation on its
own light-mode tint; prefer plain `text-destructive` or a solid fill. Status
tones have no paired foreground token; avoid placing text on solid status fills.
Application-specific identity colors belong to the application.

## Shape and composition

Primitives have square corners. Reserve `rounded-full` for dots, avatars, and
other circles. Card and dialog titles already use uppercase, tracked
`font-heading` styling.

Use `EmptyPanel` for empty states, `TableBodySkeleton` for loading table bodies,
and `<Card flush>` for an edge-to-edge list or table. `Table` scrolls wide
columns inside itself (`min-w-0 overflow-x-auto`) and tightens cell padding
below `sm`. `CardContent className="px-0"`
overrides body padding without `!px-0` when only the body should go flush. Cards
keep `min-h-min shrink-0` so they do not collapse inside a bounded flex
column, and `min-w-0` so nested tables scroll instead of widening the card.
`Dialog` already scrolls inside the viewport on small screens; avoid
additional height limits.

`Input`, `SelectTrigger`, `DatePickerButton`, `DateTimePickerButton`, and
`Combobox` share form-control chrome: 40px height, `px-3`,
`text-base md:text-sm`, `border-input`, and `shadow-xs`. Do not restyle those
triggers as outline buttons in application code.

Use `Tabs` with actual `TabsContent` panels. For URL view switches, use a labelled
`TabsNav` with links and `aria-current="page"` on the active link. The optional
Next adapter provides `TabsNavLink` with this behavior.

Use `FormTextField`, `FormSelectField`, `FormDatePickerField`,
`FormDateTimePickerField`, and `FormFeedbackField` for portable form controls,
and `FieldError` for field messages. `Combobox`, `DatePickerButton` (including
`mode="range"`), `DateTimePickerButton`, `ThemeProvider`, `ErrorBoundary`, and
`SortableTableHead` are first-class kit pieces. Domain data and application shells stay with the application: currency
or timezone option lists, query-library error views, markdown editors, kanban
boards, and dashboard widgets.
