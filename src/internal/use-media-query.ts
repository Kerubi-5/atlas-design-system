"use client"

import * as React from "react"

/** Tailwind `md` breakpoint. Used for range calendars that stack on small screens. */
export const MD_MEDIA_QUERY = "(min-width: 768px)"

/**
 * Subscribe to a CSS media query. `defaultMatches` covers SSR and environments
 * without `matchMedia` (jsdom unless the test stubs it).
 */
export function useMediaQuery(query: string, defaultMatches = false) {
  const [matches, setMatches] = React.useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return defaultMatches
    }
    return window.matchMedia(query).matches
  })

  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}
