import { act, renderHook } from "@testing-library/react"
import { hydrateRoot, type Root } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useMediaQuery } from "../src/internal/use-media-query.js"

import { stubMatchMedia } from "./helpers.js"

describe("useMediaQuery", () => {
  const original = window.matchMedia

  afterEach(() => {
    window.matchMedia = original
  })

  it("falls back to defaultMatches without matchMedia", () => {
    // @ts-expect-error simulate an environment without matchMedia
    delete window.matchMedia
    const { result } = renderHook(() => useMediaQuery("(min-width: 1px)", true))
    expect(result.current).toBe(true)
  })

  it("follows change events and unsubscribes on unmount", () => {
    let matches = false
    const listeners = new Set<() => void>()
    const remove = vi.fn((_: string, l: () => void) => listeners.delete(l))
    window.matchMedia = ((query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (_: string, l: () => void) => listeners.add(l),
      removeEventListener: remove,
    })) as unknown as typeof window.matchMedia

    const { result, unmount } = renderHook(() => useMediaQuery("(x)"))
    expect(result.current).toBe(false)
    act(() => {
      matches = true
      listeners.forEach((l) => l())
    })
    expect(result.current).toBe(true)
    unmount()
    expect(remove).toHaveBeenCalled()
  })

  // The server renders `defaultMatches`. Reading matchMedia in the first
  // client render made hydration disagree with that markup on a wide screen.
  it("hydrates with defaultMatches, then follows the real query", async () => {
    stubMatchMedia(true)
    function Probe() {
      return <span>{String(useMediaQuery("(min-width: 768px)"))}</span>
    }
    const container = document.createElement("div")
    container.innerHTML = renderToString(<Probe />).replace("true", "false")
    document.body.append(container)
    const onRecoverableError = vi.fn()
    let root: Root | undefined
    await act(async () => {
      root = hydrateRoot(container, <Probe />, { onRecoverableError })
    })
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(container.textContent).toBe("true")
    act(() => root?.unmount())
    container.remove()
  })
})
