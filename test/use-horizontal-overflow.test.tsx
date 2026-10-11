import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useHorizontalOverflow } from "../src/internal/use-horizontal-overflow.js"

/**
 * The hook decides whether a scroller joins the tab order. Table and Tabs
 * both use it; these cases cover the ResizeObserver paths the component
 * tests do not hit (no element, no observer, child observe, disconnect).
 */

class RecordingObserver {
  static instances: RecordingObserver[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    RecordingObserver.instances.push(this)
  }
}

function box(scrollWidth: number, clientWidth: number, child = false) {
  const first = child ? document.createElement("span") : null
  return {
    current: {
      scrollWidth,
      clientWidth,
      firstElementChild: first,
    } as unknown as HTMLElement,
  }
}

describe("useHorizontalOverflow", () => {
  const OriginalObserver = globalThis.ResizeObserver

  afterEach(() => {
    globalThis.ResizeObserver = OriginalObserver
    RecordingObserver.instances = []
  })

  it("stays false when the ref is empty", () => {
    const { result } = renderHook(() =>
      useHorizontalOverflow({ current: null })
    )
    expect(result.current).toBe(false)
  })

  it("stays false when ResizeObserver is missing", () => {
    // @ts-expect-error jsdom-without-observer
    delete globalThis.ResizeObserver
    const { result } = renderHook(() => useHorizontalOverflow(box(800, 390)))
    expect(result.current).toBe(false)
  })

  it("is true while content is wider than the box", () => {
    globalThis.ResizeObserver =
      RecordingObserver as unknown as typeof ResizeObserver
    const { result } = renderHook(() => useHorizontalOverflow(box(800, 390)))
    expect(result.current).toBe(true)
    expect(RecordingObserver.instances[0]?.observe).toHaveBeenCalledTimes(1)
  })

  it("is false when the content fits", () => {
    globalThis.ResizeObserver =
      RecordingObserver as unknown as typeof ResizeObserver
    const { result } = renderHook(() => useHorizontalOverflow(box(390, 390)))
    expect(result.current).toBe(false)
  })

  it("observes the first child and disconnects on unmount", () => {
    globalThis.ResizeObserver =
      RecordingObserver as unknown as typeof ResizeObserver
    const ref = box(800, 390, true)
    const { unmount } = renderHook(() => useHorizontalOverflow(ref))
    const observer = RecordingObserver.instances[0]
    expect(observer?.observe).toHaveBeenCalledTimes(2)
    expect(observer?.observe).toHaveBeenLastCalledWith(
      ref.current!.firstElementChild
    )
    unmount()
    expect(observer?.disconnect).toHaveBeenCalledTimes(1)
  })

  it("re-checks when the observer fires", () => {
    globalThis.ResizeObserver =
      RecordingObserver as unknown as typeof ResizeObserver
    const ref = box(390, 390)
    const { result } = renderHook(() => useHorizontalOverflow(ref))
    expect(result.current).toBe(false)
    act(() => {
      ;(ref.current as unknown as { scrollWidth: number }).scrollWidth = 800
      RecordingObserver.instances[0]?.callback(
        [] as unknown as ResizeObserverEntry[],
        RecordingObserver.instances[0] as unknown as ResizeObserver
      )
    })
    expect(result.current).toBe(true)
  })
})
