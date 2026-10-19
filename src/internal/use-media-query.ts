"use client"

import * as React from "react"

/** Tailwind `md` breakpoint. Used for range calendars that stack on small screens. */
export const MD_MEDIA_QUERY = "(min-width: 768px)"

/**
 * A pointer that can hover (a mouse or trackpad). Touch and coarse pointers
 * must use click; a hover-open popover would trap them after the first tap.
 */
export const HOVER_MEDIA_QUERY = "(hover: hover) and (pointer: fine)"

function hasMatchMedia() {
  return (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
  )
}

/**
 * Subscribe to a CSS media query with `useSyncExternalStore`. The server
 * render and hydration use `defaultMatches`, so the markup always agrees;
 * React then re-renders with the real value. `defaultMatches` also covers
 * environments without `matchMedia` (jsdom unless the test stubs it).
 */
export function useMediaQuery(query: string, defaultMatches = false) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!hasMatchMedia()) return () => {}
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => (hasMatchMedia() ? window.matchMedia(query).matches : defaultMatches),
    () => defaultMatches
  )
}
