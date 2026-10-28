# Design rules

Atlas owns these shared rules, its theme, and component implementations. Change
them here and release a package version. Build application-specific UI by composing
the shipped components.

Use [COMPONENTS.md](./COMPONENTS.md) for public entry points, props, and
component-specific behavior.

## Tokens

Use semantic colors, radii, and fonts: `bg-primary`, `text-muted-foreground`,
`border-border`, and `font-heading`. Avoid raw palette classes and separate
light/dark color pairs; tokens already switch with the theme.

Selected or active navigation, tabs, toggles, chips, rows, and labels use
`bg-selected text-selected-foreground` plus a `border-selected-foreground`
border or bar: the wash alone is too faint to show state (1.2:1 against the
page). Outline and ghost buttons hover with `border-selected-foreground`,
`text-selected-foreground`, and the selected wash, not a muted grey fill,
even on a selected row (a "Clear selection" button, for example).
Table row hover can stay `hover:bg-muted`. The shipped controls apply this
distinction.

For brand-colored text (links, hovered labels), use `text-selected-foreground`:
it is the primary purple in light mode and a lighter purple in dark mode.
`text-primary` as text fails contrast on the dark background (about 3.6:1).

Use `success`, `warning`, and `destructive` for good, caution, and bad states.
For tinted status chips, use `Badge variant="soft"` with a `tone` (listed in
its COMPONENTS.md row); each tone meets AA as text on the page, a card, and
its own soft tint in both themes. Status tones have no paired foreground token;
avoid placing text on solid status fills. Application-specific identity colors
belong to the application.

### Public tokens and slots

These are public API from 1.0, so apps may use them and a rename or removal
is a breaking change:

- Color tokens and their `--color-*` utilities: `background`, `foreground`,
  `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `selected`
  (each with its `-foreground` pair where one exists), `destructive`,
  `success`, `warning`, `border`, `input`, `ring`, `chart-1` to `chart-5`,
  and the `sidebar` set.
- `--radius` and the `--radius-*` scale, and `--font-heading`.
- Every `data-slot` listed under "Styling parts" in
  [COMPONENTS.md](./COMPONENTS.md#styling-parts).

Everything else in `theme.css` is internal and may change in a minor
release: the scroll-shadow variables (`--scroll-fade`, `--scroll-fill`,
`--table-scroll-fade`, `--tabs-scroll-fade`) and any `data-slot` not listed
in COMPONENTS.md.

### Prop names

- A controlled value is `value` with `onValueChange`; open state is `open`
  with `onOpenChange`; a checked state is `checked` with `onCheckedChange`.
- Sizes run `sm`, `default`, `lg`; `Button` adds `xs` and `icon-*` sizes.
- `variant="default"` is the plain look; other variants name what they mean
  (`outline`, `ghost`, `destructive`).

Deprecated props and exports say so, with the replacement, in their JSDoc
and their row in [COMPONENTS.md](./COMPONENTS.md).

## Accessibility

The target is WCAG 2.2 AA. CI runs axe-core's WCAG 2.2 A and AA rules against
every Storybook story and every open overlay (menus, listboxes, dialogs,
popovers, tooltips, toasts) in light and dark mode, checks that focus never
lands in content an open overlay hides, and checks the theme's token pairs
for text and non-text contrast in both themes (`npm run test:a11y --prefix
site`). A violation fails the build. Automated checks do not replace
keyboard and screen-reader testing.

- Text meets 4.5:1 against its background. The token pairs are tuned for it,
  including `text-muted-foreground` on `bg-muted` and status text on its soft
  tint; raw colors and opacity tricks are where contrast breaks.
- Every control has an accessible name: a `Label` with `htmlFor`, or
  `aria-label` on icon-only buttons and an unlabelled `Combobox`.
- Visible text is part of the accessible name, so speech users can say what
  they see (the calendar labels days "September 27", not "27th").
- Non-text contrast is 3:1 against what the element sits on (WCAG 1.4.11):
  field, checkbox, radio, and switch boundaries (`border-input`), checked
  fills (`bg-primary`), selected borders (`border-selected-foreground`), and
  the focus ring. `border-border` is for dividers and card edges only; never
  make it the only boundary of a control. Loading placeholders (`Skeleton`)
  use `bg-muted`. They are decorative, not UI boundaries, so they do not
  use the input-boundary token.
- Focus is a solid `ring-ring` (brand purple), never a translucent ring such
  as `ring-ring/30`, which fades below 3:1. Keyboard-highlighted menu and list
  items show a 2px `ring` bar on their leading edge. Content that scrolls must
  be reachable by keyboard; `Table`, `TabsList`, and `TabsNav` add their
  scroller to the tab order while they overflow.

## Writing

Write labels and messages in sentence case; components that display uppercase
(buttons, card and dialog titles, badges) apply it with CSS, so screen readers
still read normal words.

- **Buttons** say what happens: a verb and, when needed, a noun ("Save",
  "Export orders", "Delete order"). Avoid "OK", "Submit", and "Click here".
  In a confirmation dialog, the confirm button repeats the action from the
  title ("Delete order?" / "Delete order").
- **Errors** say what happened and what to do next, in plain words: "Could
  not save. Check your connection and try again." Don't blame the user or
  show only a code. Field errors name the fix: "Enter an email address like
  name@company.com."
- **Empty states** say what will appear and how to add the first one: "No
  orders yet. Orders you create show up here."
- **Toasts** confirm in past tense and stay short ("Settings saved"). Anything
  the user must act on belongs in an `Alert` or dialog, not a toast.
- **Placeholders** show an example, never the label; every field keeps a
  visible `Label`.
- Skip "please", exclamation marks, and filler ("Successfully saved" is
  "Saved"). Use numerals, and `tabular-nums` where numbers line up in columns.

## Shape and composition

Primitives have square corners. Reserve `rounded-full` for dots, avatars,
and other circles. Card and dialog titles already use
uppercase, tracked `font-heading` styling. Toasts use the same square corners
and Alert's left padding, with a square close button inside the top-right
corner. The toaster floats over the page at its `position`, anchored to the
viewport; mount one near the app root. A plain `toast()` has no icon — status icons
belong to `success`, `info`, `warning`, `error`, and `loading`. Tone colors
the icon, title, and border, not the body.

Use `EmptyPanel` for empty states, `TableBodySkeleton` for loading table bodies,
and `<Card flush>` for an edge-to-edge list or table. `Table` scrolls wide
columns inside itself, `Card` neither collapses in a bounded flex column nor
widens around a nested table, and `Dialog` already scrolls inside the
viewport on small screens; avoid additional height limits. The classes each
one uses are in its COMPONENTS.md row.

Apps decide how wide and tall containers and overlays are. The kit sets
intrinsic control sizes (the button, input, tab and row heights, icons,
checkboxes, switches, avatars, slider thumbs, and track thickness) and
clamps overlays to the viewport, but no design widths or heights on
dialogs, popovers, menus, or lists. Set them with `className`: give each
`DialogContent` a width such as `sm:max-w-md`, and each `PopoverContent`
one such as `w-72`. Where the sized part is not the element `className`
reaches, a `*ClassName` prop names it, with its default where there is one
(COMPONENTS.md, "Styling parts"). The few parts that keep a reading width or
a starting height (`Tooltip`, `Textarea`) take `className` to override it;
toasts keep their width.

Parents do not force sizes on their children. A vertical `Field` stretches
its controls through the flex column, so a control's own width class (such
as `w-32`) wins; `Field` and `Alert` set no width of their
own. `FieldGroup` and `Pagination` keep `w-full` because an inline-size container has no
intrinsic width. Size classes that `className` should be able to replace are
plain classes picked from props (`Avatar` `size`, `Separator` orientation,
`SelectTrigger` `size`, tab orientation), never `data-*` variants, which sort
after plain classes and would win. Every part an app may want to style is
reachable: through `className` on the part, a named `*ClassName` prop when the
part sits inside a component (listed in COMPONENTS.md under "Styling parts"),
or its `data-slot`.

`Input`, `SelectTrigger`, `DatePickerButton`, `DateTimePickerButton`, and
`Combobox` share form-control chrome: 40px height, `px-3`,
`text-base md:text-sm`, `border-input`, and `shadow-xs`. Do not restyle those
triggers as outline buttons in application code.

Build forms from the `form/*` fields; [Forms](./COMPONENTS.md#forms) in
COMPONENTS.md says how they lay out and when they show errors. Pick other
components by their rows there. Domain data and application shells stay
with the application: currency or timezone option lists, query-library
error views, and WYSIWYG editors.
