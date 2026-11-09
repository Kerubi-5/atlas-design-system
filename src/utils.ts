import type { ChangeEvent } from "react"
import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Default twMerge treats unknown `text-*` names as colors. `text-micro` would
 * then lose to `text-foreground` and would not replace `text-xs`. Register
 * it as a font size so Badge and Kanban keep the token.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Read the next value from an input event for a controlled text field. */
export function onInputChange(setValue: (value: string) => void) {
  return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }
}
