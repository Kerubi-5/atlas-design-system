/**
 * Classes and placement defaults shared by the kit's floating surfaces
 * (Popover, DropdownMenu, Select, Dialog, Tooltip) and the option rows
 * inside them. Components use these instead of retyping them, so the
 * panels and rows look, sit, and move the same everywhere. Tailwind only
 * generates class names it finds as literals, so every class appears here
 * in full.
 */

/** The panel: square corners, popover colors, shadow, and a hairline ring. */
export const overlaySurface =
  "rounded-none bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"

/** Slide in from the trigger, on whichever side Radix placed the panel. */
export const overlaySideSlide =
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"

/**
 * Fade on open and close. `data-open` and `data-closed` (theme.css) match
 * Radix's `data-state="open"` and `"closed"`.
 */
export const overlayFade =
  "duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"

/** Fade plus a slight zoom, for panels (the backdrop only fades). */
export const overlayFadeZoom = `${overlayFade} data-open:zoom-in-95 data-closed:zoom-out-95`

/**
 * A panel opened from a trigger (Popover, Select, DropdownMenu): the
 * surface, sliding in from the trigger's side with a fade and zoom.
 */
export const anchoredPanel = `${overlaySurface} ${overlaySideSlide} ${overlayFadeZoom}`

/**
 * Base of a menu or listbox row (SelectItem, DropdownMenuItem, Combobox and
 * SearchPicker options). Each component adds its own right padding and
 * indicator, plus the highlight from `optionState`.
 */
export const optionRow =
  "relative flex w-full cursor-default items-center gap-2.5 rounded-none py-2 pl-3 text-left text-sm outline-hidden select-none"

/** Group label in a menu or listbox (DropdownMenuLabel, SelectLabel). */
export const menuLabel =
  "px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase"

/** Default gap in px between a trigger and its panel (Radix `sideOffset`). */
export const OVERLAY_SIDE_OFFSET = 4

/** Default px a panel keeps from the viewport edge (Radix `collisionPadding`). */
export const OVERLAY_COLLISION_PADDING = 8
