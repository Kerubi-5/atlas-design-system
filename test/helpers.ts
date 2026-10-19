import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, vi } from "vitest"

import type { FieldErrorMessage } from "../src/form/field-error.js"

/**
 * Shared Testing Library entry for kit behavior tests.
 * Prefer roles, labels, and attributes a consumer relies on.
 */
export function createUser() {
  return userEvent.setup()
}

export { render, screen, waitFor, within }

/** The `[data-slot=name]` element under `root`; throws when it is missing. */
export function slot(name: string, root: ParentNode = document) {
  const element = root.querySelector(`[data-slot="${name}"]`)
  if (!(element instanceof HTMLElement)) {
    throw new Error(`No [data-slot="${name}"]`)
  }
  return element
}

/** The class tokens of an element; empty when there is no element. */
export function classes(element: Element | null | undefined) {
  return element?.getAttribute("class")?.split(/\s+/) ?? []
}

/**
 * Day buttons expose `data-day` from `toLocaleDateString`. Pin en-US so the
 * query is stable in CI.
 */
export function getDayButton(date: Date) {
  const stamp = date.toLocaleDateString("en-US")
  const button = document.querySelector(`[data-day="${stamp}"]`)
  if (!(button instanceof HTMLElement)) {
    throw new Error(`No calendar day button for ${stamp}`)
  }
  return button
}

/** The open popover panel, once Radix has mounted it. */
export function findPopoverContent() {
  return waitFor(() => {
    const node = document.querySelector("[data-slot=popover-content]")
    expect(node).toBeTruthy()
    return node as HTMLElement
  })
}

/**
 * Dismiss the toasts a test raised and wait for Sonner's unmount timers, so
 * none fires after jsdom is torn down. Call it inside the describe whose
 * tests call `toast()`.
 */
export function dismissToastsAfterEach() {
  afterEach(async () => {
    // Loaded here so test files without toasts do not pull in Sonner.
    const { toast } = await import("../src/toast.js")
    act(() => {
      toast.dismiss()
    })
    await waitFor(() =>
      expect(document.querySelector("[data-sonner-toast]")).toBeNull()
    )
  })
}

/** Classes a form-control trigger must share with Input / SelectTrigger. */
export const formControlTriggerTokens = [
  "px-3",
  "text-base",
  "md:text-sm",
  "border-input",
  "bg-background",
  "shadow-xs",
] as const

/** Assert a picker trigger uses form-control chrome, not Button outline. */
export function expectFormControlTrigger(element: HTMLElement) {
  const tokens = classes(element)
  for (const token of formControlTriggerTokens) {
    expect(tokens).toContain(token)
  }
  expect(tokens).not.toContain("text-xs")
  expect(tokens).not.toContain("px-6")
  expect(element.className).not.toMatch(/has-data-\[icon=inline-start\]:pl-4/)
  expect(element.className).not.toMatch(/has-data-\[icon=inline-end\]:pr-4/)
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

/** A TanStack-shaped text field for the `form/*` adapters, with spy handlers. */
export function fakeTextField(
  name: string,
  value: string,
  errors: FieldErrorMessage[] = []
) {
  return {
    name,
    state: { value, meta: { errors } },
    handleChange: vi.fn<(value: string) => void>(),
    handleBlur: vi.fn<() => void>(),
  }
}
