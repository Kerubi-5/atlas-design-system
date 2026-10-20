import { fireEvent, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  DRAG_THRESHOLD,
  useDragScroll,
} from "../src/internal/use-drag-scroll.js"

import { dragWithMouse, mouse, move, press, release } from "./helpers.js"

/**
 * The hook behind the mouse drag on `TabsNav` and `TabsList`. The component
 * tests cover a drag and a plain click; these cover the guards: not enabled,
 * touch, other buttons, a release outside the box, a cancelled pointer and
 * cleanup.
 */

function mount(enabled = true) {
  const element = document.createElement("div")
  document.body.appendChild(element)
  element.scrollLeft = 100
  const ref = { current: element }
  const hook = renderHook(({ on }) => useDragScroll(ref, on), {
    initialProps: { on: enabled },
  })
  return { element, ...hook }
}

/** True when the click reached the element with its default intact. */
function clickGoesThrough(element: Element) {
  return fireEvent.click(element)
}

describe("useDragScroll", () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it("does nothing while not enabled", () => {
    const { element } = mount(false)
    dragWithMouse(element, 200, 100)
    expect(element.scrollLeft).toBe(100)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("scrolls by the pointer travel once past the threshold", () => {
    const { element } = mount()
    press(element, 200)
    move(element, 200 - DRAG_THRESHOLD + 1)
    expect(element.scrollLeft).toBe(100)
    move(element, 200 - DRAG_THRESHOLD)
    expect(element.scrollLeft).toBe(100 + DRAG_THRESHOLD)
    move(element, 150)
    expect(element.scrollLeft).toBe(150)
    release(element, 150)
    expect(clickGoesThrough(element)).toBe(false)
    // Only the click that follows the drag is swallowed.
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("leaves a press that never crosses the threshold as a click", () => {
    const { element } = mount()
    dragWithMouse(element, 200, 200 + DRAG_THRESHOLD - 1)
    expect(element.scrollLeft).toBe(100)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("ignores touch and pen, which scroll natively", () => {
    const { element } = mount()
    for (const pointerType of ["touch", "pen"]) {
      const init = { ...mouse, pointerType }
      dragWithMouse(element, 200, 100, init)
    }
    expect(element.scrollLeft).toBe(100)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("ignores buttons other than the left one", () => {
    const { element } = mount()
    press(element, 200, { ...mouse, button: 2 })
    move(element, 100)
    release(element, 100)
    expect(element.scrollLeft).toBe(100)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("ignores moves from another pointer", () => {
    const { element } = mount()
    press(element, 200)
    move(element, 100, { ...mouse, pointerId: 2 })
    expect(element.scrollLeft).toBe(100)
    release(element, 200)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("drops a press whose button came up outside the box", () => {
    const { element } = mount()
    press(element, 200)
    fireEvent.pointerMove(element, { ...mouse, buttons: 0, clientX: 100 })
    expect(element.scrollLeft).toBe(100)
    // A later move with the button up again is not a drag either.
    fireEvent.pointerMove(element, { ...mouse, buttons: 1, clientX: 50 })
    expect(element.scrollLeft).toBe(100)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("lets the next click through after a cancelled drag", () => {
    const { element } = mount()
    press(element, 200)
    move(element, 100)
    expect(element.scrollLeft).toBe(200)
    fireEvent.pointerCancel(element, { ...mouse, buttons: 0 })
    expect(clickGoesThrough(element)).toBe(true)
    // Another pointer's cancel is not this press.
    press(element, 200)
    fireEvent.pointerCancel(element, { ...mouse, pointerId: 2 })
    move(element, 150)
    expect(element.scrollLeft).toBe(250)
    release(element, 150)
  })

  it("blocks native link drags and text selection only during a press", () => {
    const { element } = mount()
    expect(fireEvent.dragStart(element)).toBe(true)
    expect(
      fireEvent(element, new Event("selectstart", { cancelable: true }))
    ).toBe(true)
    press(element, 200)
    expect(fireEvent.dragStart(element)).toBe(false)
    expect(
      fireEvent(element, new Event("selectstart", { cancelable: true }))
    ).toBe(false)
    release(element, 200)
    expect(fireEvent.dragStart(element)).toBe(true)
  })

  it("removes its listeners when disabled or unmounted", () => {
    const { element, rerender, unmount } = mount()
    rerender({ on: false })
    dragWithMouse(element, 200, 100)
    expect(element.scrollLeft).toBe(100)

    rerender({ on: true })
    press(element, 200)
    move(element, 150)
    expect(element.scrollLeft).toBe(150)
    release(element, 150)
    expect(clickGoesThrough(element)).toBe(false)

    unmount()
    dragWithMouse(element, 200, 100)
    expect(element.scrollLeft).toBe(150)
    expect(clickGoesThrough(element)).toBe(true)
  })

  it("does nothing without an element", () => {
    const { result } = renderHook(() => useDragScroll({ current: null }, true))
    expect(result.current).toBeUndefined()
  })
})
