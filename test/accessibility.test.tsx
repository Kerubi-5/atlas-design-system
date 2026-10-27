import { describe, expect, it } from "vitest"

import { Calendar } from "../src/calendar.js"

import { render, screen } from "./helpers.js"
import { srcModules } from "./repo-files.js"

describe("accessible names", () => {
  it("names calendar days with the visible number, not an ordinal", () => {
    render(
      <Calendar
        mode="single"
        locale={{ code: "en-US" }}
        defaultMonth={new Date(2026, 9, 1)}
        selected={new Date(2026, 9, 9)}
        // Pin "today" so 27 Oct keeps the documented name instead of
        // "Today, Tuesday, October 27, 2026" when the suite runs on that date.
        today={new Date(2026, 0, 1)}
      />
    )
    expect(
      screen.getByRole("button", { name: "Tuesday, October 27, 2026" })
    ).toHaveTextContent("27")
    expect(
      screen.getByRole("button", { name: "Friday, October 9, 2026, selected" })
    ).toHaveTextContent("9")
    expect(
      screen.queryByRole("button", { name: /\d(st|nd|rd|th)\b/ })
    ).toBeNull()
  })
})

describe("focus cues (WCAG 1.4.11)", () => {
  const sources = srcModules()

  it("draws focus with the solid ring color, never a translucent one", () => {
    expect(sources.length).toBeGreaterThan(20)
    for (const [file, source] of sources) {
      expect(
        source.match(/(focus-visible|\/day):ring-(ring|primary)\/\d+/g),
        file
      ).toBeNull()
    }
  })
})
