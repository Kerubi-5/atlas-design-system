import { describe, expect, it } from "vitest"

import { Markdown, MarkdownContent, safeMarkdownUrl } from "../src/markdown.js"

import { render, screen } from "./helpers.js"

describe("safeMarkdownUrl", () => {
  it("keeps http, https, mailto, hash, and root paths", () => {
    expect(safeMarkdownUrl("https://example.com")).toBe("https://example.com")
    expect(safeMarkdownUrl("http://example.com")).toBe("http://example.com")
    expect(safeMarkdownUrl("mailto:hi@example.com")).toBe(
      "mailto:hi@example.com"
    )
    expect(safeMarkdownUrl("#notes")).toBe("#notes")
    expect(safeMarkdownUrl("/docs")).toBe("/docs")
  })

  it("strips javascript and unknown schemes", () => {
    expect(safeMarkdownUrl("javascript:alert(1)")).toBe("")
    expect(safeMarkdownUrl("data:text/html,hi")).toBe("")
    expect(safeMarkdownUrl("vbscript:msg")).toBe("")
  })
})

describe("Markdown", () => {
  it("renders GFM and aliases MarkdownContent", () => {
    render(
      <Markdown
        content={"## Title\n\nA **bold** [link](https://example.com)."}
      />
    )

    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument()
    const link = screen.getByRole("link", { name: "link" })
    expect(link).toHaveAttribute("href", "https://example.com")
    expect(link).toHaveAttribute("rel", "noreferrer noopener")
    expect(MarkdownContent).toBe(Markdown)
  })

  it("does not render raw HTML or unsafe links", () => {
    render(
      <Markdown
        content={"<script>alert(1)</script>\n\n[x](javascript:alert(1))"}
      />
    )

    expect(document.querySelector("script")).toBeNull()
    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByText("x").tagName).toBe("SPAN")
  })
})
