import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback, AvatarImage } from "../src/avatar.js"

import { render, screen } from "./helpers.js"

describe("Avatar", () => {
  it("shows the fallback while the image has not loaded", () => {
    render(
      <Avatar size="lg">
        <AvatarImage src="/missing.png" alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText("AL")
    expect(fallback.className).toContain("rounded-full")
    expect(fallback.closest("[data-slot=avatar]")).toHaveAttribute(
      "data-size",
      "lg"
    )
  })
})
