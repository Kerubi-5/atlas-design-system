import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ErrorBoundary, ErrorFallback } from "../src/error-boundary.js"

import { createUser, render, screen } from "./helpers.js"

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error("render failed")
  return <p>Safe</p>
}

function RecoverableBoundary({
  onError,
}: {
  onError?: (error: Error) => void
}) {
  const [explode, setExplode] = useState(true)

  return (
    <>
      <button type="button" onClick={() => setExplode(false)}>
        Repair child
      </button>
      <ErrorBoundary message="Could not load this view." onError={onError}>
        <Bomb explode={explode} />
      </ErrorBoundary>
    </>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("ErrorFallback", () => {
  it("fires retry and reload callbacks", async () => {
    const user = createUser()
    const onRetry = vi.fn()
    const onReload = vi.fn()

    render(
      <ErrorFallback
        message="Could not load this view."
        onRetry={onRetry}
        onReload={onReload}
      />
    )

    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Could not load this view.")

    await user.click(screen.getByRole("button", { name: "Try again" }))
    await user.click(screen.getByRole("button", { name: "Reload" }))

    expect(onRetry).toHaveBeenCalledOnce()
    expect(onReload).toHaveBeenCalledOnce()
  })
})

describe("ErrorBoundary", () => {
  it("catches a thrown child, renders the fallback, and retries", async () => {
    const user = createUser()
    const onError = vi.fn()
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(<RecoverableBoundary onError={onError} />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load this view."
    )
    expect(screen.queryByText("Safe")).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0]?.[0].message).toBe("render failed")

    await user.click(screen.getByRole("button", { name: "Repair child" }))
    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(screen.getByText("Safe")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()

    errorSpy.mockRestore()
  })

  it("reloads the page from the fallback action", async () => {
    const user = createUser()
    const reload = vi.fn()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubGlobal("location", { ...window.location, reload })

    render(
      <ErrorBoundary message="Broken">
        <Bomb explode />
      </ErrorBoundary>
    )

    await user.click(screen.getByRole("button", { name: "Reload" }))
    expect(reload).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })
})
