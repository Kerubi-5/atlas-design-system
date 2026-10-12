import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

import "@testing-library/jest-dom/vitest"

import { stubMatchMedia } from "./helpers.js"

/** jsdom has no layout; default to below the Tailwind `md` breakpoint. */
stubMatchMedia(false)

afterEach(() => {
  cleanup()
  stubMatchMedia(false)
})

/**
 * Radix popovers, dialogs, and next-themes need a few browser APIs that jsdom
 * does not implement. Stub only the methods the primitives call during tests.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
