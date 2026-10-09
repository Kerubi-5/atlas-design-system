import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect } from "vitest"

/**
 * Shared Testing Library entry for kit behavior tests.
 * Prefer roles, labels, and attributes a consumer relies on.
 */
export function createUser() {
  return userEvent.setup()
}

export { render, screen, waitFor, within }

/** Classes a form-control trigger must share with Input / SelectTrigger. */
export const formControlTriggerTokens = [
  "h-10",
  "px-3",
  "text-base",
  "md:text-sm",
  "border-input",
  "bg-background",
  "shadow-xs",
] as const

/** Assert a picker trigger uses form-control chrome, not Button outline. */
export function expectFormControlTrigger(element: HTMLElement) {
  const className = element.className
  for (const token of formControlTriggerTokens) {
    expect(className.split(/\s+/)).toContain(token)
  }
  expect(className.split(/\s+/)).not.toContain("text-xs")
  expect(className.split(/\s+/)).not.toContain("px-6")
  expect(className).not.toMatch(/has-data-\[icon=inline-start\]:pl-4/)
  expect(className).not.toMatch(/has-data-\[icon=inline-end\]:pr-4/)
}

type MatchMediaListener = (event: MediaQueryListEvent) => void

/**
 * Replace `window.matchMedia` for one test. jsdom's default stub always
 * reports `matches: false` (below `md`).
 */
export function stubMatchMedia(
  matches: boolean | ((query: string) => boolean)
) {
  const listeners = new Set<MatchMediaListener>()
  const resolve = (query: string) =>
    typeof matches === "function" ? matches(query) : matches

  window.matchMedia = (query: string) =>
    ({
      matches: resolve(query),
      media: query,
      onchange: null,
      addListener(listener: MatchMediaListener) {
        listeners.add(listener)
      },
      removeListener(listener: MatchMediaListener) {
        listeners.delete(listener)
      },
      addEventListener(_type: string, listener: EventListener) {
        listeners.add(listener as MatchMediaListener)
      },
      removeEventListener(_type: string, listener: EventListener) {
        listeners.delete(listener as MatchMediaListener)
      },
      dispatchEvent() {
        return false
      },
    }) as MediaQueryList

  return () => {
    listeners.clear()
  }
}
