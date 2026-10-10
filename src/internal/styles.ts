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
