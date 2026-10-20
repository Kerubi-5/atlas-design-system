import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, vi } from "vitest"

import type {
  FieldErrorMessage,
  FieldMetaState,
} from "../src/form/field-error.js"

/**
 * Shared Testing Library entry for kit behavior tests.
 * Prefer roles, labels, and attributes a consumer relies on.
 */
export function createUser() {
  return userEvent.setup()
}

export { render, screen, waitFor, within }

/** The user `createUser` returns. */
export type User = ReturnType<typeof createUser>

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

/** The month the picker tests open on: October 2026. */
export const october = new Date(2026, 9, 1)

/** Day `date` of October 2026, or of another month and year. */
export function day(date: number, month = 9, year = 2026) {
  return new Date(year, month, date)
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

/** Click the picker trigger named `name`; resolves to the calendar grids. */
export async function openPicker(user: User, name: string | RegExp) {
  await user.click(screen.getByRole("button", { name }))
  return screen.findAllByRole("grid")
}

/** Wait until nothing with `role` is left, e.g. once an overlay closes. */
export function waitForNoRole(role: string) {
  return waitFor(() => {
    expect(screen.queryAllByRole(role)).toHaveLength(0)
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

/**
 * jsdom has no layout, so every element reports an 800px row in a 390px
 * box while `run` executes: a horizontal scroller overflows, joins the tab
 * order and takes mouse drags.
 */
export async function withOverflow(run: () => Promise<void>) {
  const descriptors = {
    scrollWidth: Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollWidth"
    ),
    clientWidth: Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientWidth"
    ),
  }
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get: () => 800,
  })
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 390,
  })
  try {
    await run()
  } finally {
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) {
        Object.defineProperty(HTMLElement.prototype, key, descriptor)
      } else {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
          key
        ]
      }
    }
  }
}

/**
 * A TanStack-shaped text field for the `form/*` adapters, with spy handlers.
 * Pass its errors, or a whole `meta` to set `isTouched` as well.
 */
export function fakeTextField(
  name: string,
  value: string,
  meta: FieldErrorMessage[] | FieldMetaState = []
) {
  return {
    name,
    state: { value, meta: Array.isArray(meta) ? { errors: meta } : meta },
    handleChange: vi.fn<(value: string) => void>(),
    handleBlur: vi.fn<() => void>(),
  }
}
