/**
 * State classes shared by the kit's controls. Components add these with
 * `cn()` instead of retyping them, so a state looks the same everywhere and
 * a change (such as the WCAG focus ring) happens here once. Tailwind only
 * generates class names it finds as literals, so each state attribute gets
 * its own complete string. `test/dry.test.ts` fails when a component types
 * one of these by hand.
 */

/** Keyboard focus: a ring-colored border plus a solid 2px ring (WCAG 1.4.11). */
export const focusRing =
  "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"

/** `aria-invalid`: destructive border and a soft glow; the error text carries the message. */
export const invalidState =
  "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

/** Native `disabled`: dimmed, with no hover or click. */
export const disabledState = "disabled:pointer-events-none disabled:opacity-50"

/** Radix `data-disabled` (menu and list items, slider). */
export const dataDisabledState =
  "data-disabled:pointer-events-none data-disabled:opacity-50"

/** The text-field surface, so Input, Textarea, and SelectTrigger line up. */
export const fieldSurface =
  "w-full min-w-0 rounded-none border border-input bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm"

/**
 * Selected chrome: the wash, selected text, and a selected border, because
 * the wash alone is 1.2:1 against the page. One string per state attribute.
 */
export const selectedState = {
  /**
   * Toggle and ToggleGroupItem. Radix Toggle sets `data-state=on` and
   * `aria-pressed`; group items always set `data-state=on`, add
   * `aria-pressed` in multiple mode, and are radios with `aria-checked` in
   * single mode. All three get the same chrome.
   */
  toggle:
    "data-on:border-selected-foreground data-on:bg-selected data-on:text-selected-foreground aria-pressed:border-selected-foreground aria-pressed:bg-selected aria-pressed:text-selected-foreground aria-checked:border-selected-foreground aria-checked:bg-selected aria-checked:text-selected-foreground",
  /** Tab trigger and TabsNav link (`data-state="active"`). */
  active:
    "data-[state=active]:border-selected-foreground data-[state=active]:bg-selected data-[state=active]:text-selected-foreground",
  /** Current page (`data-active="true"`). */
  current:
    "data-[active=true]:border-selected-foreground data-[active=true]:bg-selected data-[active=true]:text-selected-foreground",
  /** Trigger whose menu or popover is open. */
  expanded:
    "aria-expanded:border-selected-foreground aria-expanded:bg-selected aria-expanded:text-selected-foreground",
  /** Quiet buttons and toggles on hover. */
  hover:
    "hover:border-selected-foreground hover:bg-selected hover:text-selected-foreground",
}

/** The "No results" row of a listbox. */
export const listboxEmpty =
  "px-3 py-4 text-center text-sm text-muted-foreground"

/** Options in menus and listboxes. */
export const optionState = {
  /** Highlight as focus moves: grey fill plus a 2px ring bar (the fill alone is 1.1:1). */
  focus:
    "focus:bg-accent focus:text-accent-foreground focus:shadow-[inset_2px_0_0_var(--color-ring)]",
  /** The same highlight for lists that track the active option in state. */
  active:
    "bg-accent text-accent-foreground shadow-[inset_2px_0_0_var(--color-ring)]",
  /** The chosen value (`data-state="checked"`); a check icon marks it too. */
  checked:
    "data-[state=checked]:bg-selected data-[state=checked]:text-selected-foreground",
  /** The chosen value in lists that track selection in state. */
  selected: "bg-selected text-selected-foreground",
}

/** `aria-disabled` (links and cells that cannot be `disabled`): dimmed, with no hover or click. */
export const ariaDisabledState =
  "aria-disabled:pointer-events-none aria-disabled:opacity-50"

/**
 * Larger click target for a small choice control (checkbox, radio, switch):
 * an invisible `::after` 12px wider each side and 8px taller each side. The
 * control needs `relative`.
 */
export const choiceHitArea = "after:absolute after:-inset-x-3 after:-inset-y-2"

/**
 * 44×44px invisible `::after` centred on a small control (slider thumb,
 * icon trigger), the WCAG 2.5.5 target size. The control needs `relative`.
 */
export const hitArea44 =
  "after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"

/**
 * Height and horizontal padding for text controls, shared by Button and
 * Toggle so a toolbar of both lines up. Padding tightens on the icon side.
 */
export const controlSize = {
  default:
    "h-10 px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
  sm: "h-9 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  lg: "h-11 px-8 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
}

/**
 * Uppercase muted label used on tiles, legends, and thin section chrome.
 * Re-exported publicly from `atlas-react-kit/stat-tile`.
 */
export const sectionLabel =
  "text-xs font-semibold tracking-widest text-muted-foreground uppercase"
