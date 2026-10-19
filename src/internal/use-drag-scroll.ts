"use client"

import * as React from "react"

/** Pointer travel, in px, before a press on the scroller counts as a drag. */
export const DRAG_THRESHOLD = 4

/**
 * Lets a mouse drag a horizontal scroller sideways, the way touch already
 * does natively. Mouse only (`pointerType === "mouse"`, left button); touch
 * and pen keep the browser's own scrolling. A press becomes a drag after
 * `DRAG_THRESHOLD` px of travel, so a plain click on a tab or link still
 * activates it; once a drag has moved, the click after pointerup is
 * swallowed so the drag never also follows a link. (Radix `TabsTrigger`
 * selects on mousedown, so a drag that starts on an inactive tab still
 * selects that tab on press.)
 *
 * Listens only while `enabled` (the scroller overflows): a row that fits
 * behaves exactly as before. Keyboard scrolling is untouched.
 */
export function useDragScroll(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean
) {
  React.useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    let pointerId: number | null = null
    let startX = 0
    let startScrollLeft = 0
    let dragged = false

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return
      pointerId = event.pointerId
      startX = event.clientX
      startScrollLeft = element.scrollLeft
      dragged = false
    }

    const onPointerMove = (event: PointerEvent) => {
      if (pointerId === null || event.pointerId !== pointerId) return
      if ((event.buttons & 1) === 0) {
        // The button came up outside the scroller before capture.
        pointerId = null
        return
      }
      const delta = event.clientX - startX
      if (!dragged) {
        if (Math.abs(delta) < DRAG_THRESHOLD) return
        dragged = true
        // Keep the moves and the up when the pointer leaves the box. The
        // browser releases capture on pointerup and pointercancel.
        element.setPointerCapture(event.pointerId)
      }
      element.scrollLeft = startScrollLeft - delta
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      // `dragged` stays set so the click that follows is swallowed.
    }

    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      // No click follows a cancel, so the next real click must go through.
      dragged = false
    }

    // Capture phase, so it runs before the link's or trigger's own handler.
    const onClick = (event: MouseEvent) => {
      if (!dragged) return
      dragged = false
      event.preventDefault()
      event.stopPropagation()
    }

    // Links are draggable by default: a native drag would cancel the pointer.
    // A text selection started in the row would smear across the labels.
    const onDragOrSelectStart = (event: Event) => {
      if (pointerId !== null) event.preventDefault()
    }

    element.addEventListener("pointerdown", onPointerDown)
    element.addEventListener("pointermove", onPointerMove)
    element.addEventListener("pointerup", onPointerUp)
    element.addEventListener("pointercancel", onPointerCancel)
    element.addEventListener("click", onClick, true)
    element.addEventListener("dragstart", onDragOrSelectStart)
    element.addEventListener("selectstart", onDragOrSelectStart)
    return () => {
      element.removeEventListener("pointerdown", onPointerDown)
      element.removeEventListener("pointermove", onPointerMove)
      element.removeEventListener("pointerup", onPointerUp)
      element.removeEventListener("pointercancel", onPointerCancel)
      element.removeEventListener("click", onClick, true)
      element.removeEventListener("dragstart", onDragOrSelectStart)
      element.removeEventListener("selectstart", onDragOrSelectStart)
    }
  }, [ref, enabled])
}
