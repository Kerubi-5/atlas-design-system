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
focus with `border-primary`, `text-selected-foreground`, and the selected wash,
not a muted grey fill. Table row hover can stay `hover:bg-muted`. The shipped
controls apply this distinction.

For brand-colored text (links, hovered labels), use `text-selected-foreground`:
it is the primary purple in light mode and a lighter purple in dark mode.
`text-primary` as text fails contrast on the dark background (about 2:1).

Use `success`, `warning`, and `destructive` for good, caution, and bad states.
For tinted status chips, use `Badge variant="soft"` with `tone="success"`,
`"warning"`, or `"destructive"`; each meets AA as text on the page, a card, and
its own soft tint in both themes. Status tones have no paired foreground token;
avoid placing text on solid status fills. Application-specific identity colors
belong to the application.

## Accessibility

The target is WCAG 2.2 AA. CI runs axe-core's WCAG 2.2 A and AA rules against
every Storybook story in light and dark mode (`npm run test:a11y --prefix
site`), and a violation fails the build. Automated checks do not replace
keyboard and screen-reader testing.

- Text meets 4.5:1 against its background. The token pairs are tuned for it,
  including `text-muted-foreground` on `bg-muted` and status text on its soft
  tint; raw colors and opacity tricks are where contrast breaks.
- Every control has an accessible name: a `Label` with `htmlFor`, or
  `aria-label` on icon-only buttons and an unlabelled `Combobox`.
- Visible text is part of the accessible name, so speech users can say what
  they see (the calendar labels days "September 27", not "27th").
- Keep the focus rings the kit ships. Content that scrolls must be reachable
  by keyboard; `Table` adds itself to the tab order while it overflows.

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

`Input`, `SelectTrigger`, `DatePickerButton`, and `Combobox` share form-control
chrome: 40px height, `px-3`, `text-base md:text-sm`, `border-input`, and
`shadow-xs`. Do not restyle those triggers as outline buttons in application
code.

Use `Tabs` with actual `TabsContent` panels. For URL view switches, use a labelled
`TabsNav` with links and `aria-current="page"` on the active link. The optional
Next adapter provides `TabsNavLink` with this behavior.

Use `FormTextField`, `FormSelectField`, `FormDatePickerField`, and
`FormFeedbackField` for portable form controls, and `FieldError` for field
messages. `Combobox`, `DatePickerButton` (including `mode="range"`),
`ThemeProvider`, `ErrorBoundary`, and `SortableTableHead` are first-class kit
pieces. Domain data and application shells stay with the application: currency
or timezone option lists, query-library error views, markdown editors, kanban
boards, and dashboard widgets.
