import { describe, expect, it } from "vitest"

import { revealInline } from "../src/internal/use-horizontal-overflow.js"

/** A scroller 0–200px wide holding `element` at `left`–`right`, focused or not. */
function setup(left: number, right: number, focusVisible = true) {
  const scroller = document.createElement("div")
  const element = document.createElement("button")
  scroller.append(element)
  document.body.append(scroller)
  element.focus()
  element.matches = (selector: string) =>
    selector === ":focus-visible" ? focusVisible : false
  scroller.getBoundingClientRect = () => ({ left: 0, right: 200 }) as DOMRect
  element.getBoundingClientRect = () =>
    ({ left, right, width: right - left }) as DOMRect
  scroller.scrollLeft = 50
  return scroller
}

describe("revealInline", () => {
  it("scrolls a keyboard-focused item and its ring room into view", () => {
    // Past the end: scroll by the overhang plus 8px of ring room.
    let scroller = setup(150, 210)
    revealInline(scroller, scroller.firstElementChild!)
    expect(scroller.scrollLeft).toBe(68)
    // Before the start: scroll back to leave 8px.
    scroller = setup(4, 60)
    revealInline(scroller, scroller.firstElementChild!)
    expect(scroller.scrollLeft).toBe(46)
    // Already clear: no change.
    scroller = setup(20, 100)
    revealInline(scroller, scroller.firstElementChild!)
    expect(scroller.scrollLeft).toBe(50)
    // Wider than the scroller: keep its start in view.
    scroller = setup(30, 260)
    revealInline(scroller, scroller.firstElementChild!)
    expect(scroller.scrollLeft).toBe(72)
  })

  it("leaves the row alone for pointer focus or unlaid-out items", () => {
    let scroller = setup(150, 210, false)
    revealInline(scroller, scroller.firstElementChild!)
    expect(scroller.scrollLeft).toBe(50)
    scroller = setup(0, 0)
    revealInline(scroller, scroller.firstElementChild!)
    expect(scroller.scrollLeft).toBe(50)
  })
})
