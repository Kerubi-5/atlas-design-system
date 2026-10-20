import { describe, expect, it } from "vitest"

import { EmptyPanel } from "../src/empty-panel.js"

import { render, screen } from "./helpers.js"

describe("EmptyPanel", () => {
  it("renders empty copy with size and muted styles", () => {
    const { rerender } = render(<EmptyPanel>No rows yet.</EmptyPanel>)
    const panel = screen.getByText("No rows yet.")
    expect(panel.className).toMatch(/border-dashed/)
    expect(panel.className).toMatch(/bg-muted\/30/)
    expect(panel.className).toMatch(/py-6/)

    rerender(
      <EmptyPanel size="sm" muted={false}>
        Compact
      </EmptyPanel>
    )
    expect(screen.getByText("Compact").className).toMatch(/py-4/)
    expect(screen.getByText("Compact").className).not.toMatch(/bg-muted\/30/)

    rerender(<EmptyPanel size="lg">Wide</EmptyPanel>)
    expect(screen.getByText("Wide").className).toMatch(/py-8/)
  })

  it("treats the deprecated md as default", () => {
    render(
      <>
        <EmptyPanel size="default">Default</EmptyPanel>
        <EmptyPanel size="md">Old</EmptyPanel>
      </>
    )
    expect(screen.getByText("Default").className).toMatch(/py-6/)
    expect(screen.getByText("Old").className).toMatch(/py-6/)
  })
})
