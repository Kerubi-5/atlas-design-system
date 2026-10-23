/** Pixels kept clear beside a focused control: ring width plus offset, rounded up. */
const focusRingRoom = 8

/**
 * Scrolls `scroller` sideways so `element` and `room` pixels either side of
 * it are inside the scrollport. Focus scrolling only reveals the border box
 * (and may not move a snapping row at all), which leaves an outset focus
 * ring under the scroller's edge. Never scrolls past the element's start.
 * Only for keyboard focus (`:focus-visible`): a pointer press leaves the
 * row where the user put it.
 */
export function revealInline(
  scroller: HTMLElement,
  element: Element,
  room = focusRingRoom
) {
  const focused = scroller.ownerDocument.activeElement
  if (!focused?.matches(":focus-visible")) return
  const box = scroller.getBoundingClientRect()
  const rect = element.getBoundingClientRect()
  if (rect.width === 0) return
  const before = rect.left - room - box.left
  const after = rect.right + room - box.right
  if (before < 0) scroller.scrollLeft += before
  else if (after > 0) scroller.scrollLeft += Math.min(after, before)
}
