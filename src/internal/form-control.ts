/**
 * Chrome that makes a Button-based picker trigger match Input / SelectTrigger:
 * 40px height, px-3, body text (16px below md so iOS does not zoom), border-input,
 * background, and shadow. Button outline defaults are text-xs semibold uppercase
 * with px-6 and icon-indented pl-4/pr-4, which reads as a smaller, more indented
 * control next to real form fields. Hover stays Input-like and cancels the
 * outline Button's purple selected wash.
 */
export const formControlTriggerClassName =
  "h-10 w-full border-input bg-background px-3 font-normal text-base tracking-normal shadow-xs normal-case md:text-sm hover:border-input hover:bg-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring aria-expanded:border-input aria-expanded:bg-background aria-expanded:text-foreground has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3 dark:hover:bg-background dark:aria-expanded:bg-background"
