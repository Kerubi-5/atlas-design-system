"use client"

import * as React from "react"

/**
 * True while the element's content is wider than its box. Re-checked when
 * the container or its content resizes. Used so a horizontal scroller can
 * join the tab order only while it overflows (WCAG 2.1.1).
 */
export function useHorizontalOverflow(
  ref: React.RefObject<HTMLElement | null>
) {
  const [overflowing, setOverflowing] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === "undefined") return
    const check = () =>
      setOverflowing(element.scrollWidth > element.clientWidth + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(element)
    if (element.firstElementChild) observer.observe(element.firstElementChild)
    return () => observer.disconnect()
  }, [ref])

  return overflowing
}
