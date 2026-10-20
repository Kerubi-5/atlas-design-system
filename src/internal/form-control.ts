import { emptyValueText } from "./styles.js"

/**
 * Chrome that makes a Button-based picker trigger match Input / SelectTrigger:
 * 40px height, px-3, body text (16px below md so iOS does not zoom), border-input,
 * background, and shadow. Button outline defaults are text-xs semibold uppercase
 * with px-6 and icon-indented pl-4/pr-4, which reads as a smaller, more indented
 * control next to real form fields. Hover stays Input-like and cancels the
 * outline Button's purple selected wash.
 */
export const formControlTriggerClassName =
  "h-10 w-full border-input bg-background px-3 font-normal text-base tracking-normal shadow-xs normal-case md:text-sm hover:border-input hover:bg-background hover:text-foreground focus-visible:text-foreground aria-expanded:border-input aria-expanded:bg-background aria-expanded:text-foreground has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3 dark:hover:bg-background dark:aria-expanded:bg-background"

/**
 * Date and date-time picker trigger: the form-control chrome, start-aligned,
 * with muted text while empty (`data-empty`). Intrinsic padding makes one
 * line 40px tall while longer values wrap and consumer height classes work.
 */
export const pickerTriggerClassName = `${formControlTriggerClassName} h-auto justify-start py-[calc((--spacing(10)_-_1lh_-_2px)/2)] ${emptyValueText}`

/** Calendar popover body: fits the viewport height and scrolls inside it. */
export const pickerContentClassName =
  "max-h-(--radix-popover-content-available-height) overflow-y-auto rounded-none p-0"

/** Gutter used when a calendar popover collides with the viewport. */
export const PICKER_COLLISION_PADDING = 16

/**
 * Id of a picker trigger's value text. A form field lists it after the label
 * id in `aria-labelledby` so the trigger reads "label, value".
 */
export function pickerValueId(id: string) {
  return `${id}-value`
}
