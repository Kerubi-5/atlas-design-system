import { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/select.js"
import { ThemeProvider, useTheme } from "../src/theme-provider.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

function ThemeProbe() {
  const { theme, resolvedTheme } = useTheme()
  return (
    <p data-testid="theme">
      {theme ?? ""}:{resolvedTheme ?? ""}
    </p>
  )
}

function themeOutput() {
  return screen.getByTestId("theme")
}

async function waitForTheme(expected: string | RegExp) {
  await waitFor(() => {
    expect(themeOutput()).toHaveTextContent(expected)
  })
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.removeAttribute("style")
})

describe("ThemeProvider", () => {
  it("applies the default theme after mount", async () => {
    render(
      <ThemeProvider
        defaultTheme="dark"
        enableSystem={false}
        enableShortcut={false}
      >
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/dark:dark/)
    expect(document.documentElement).toHaveClass("dark")
  })

  it("reads and writes a custom storage key", async () => {
    localStorage.setItem("kairos-theme", "dark")

    const { unmount } = render(
      <ThemeProvider
        storageKey="kairos-theme"
        defaultTheme="light"
        enableSystem={false}
        enableShortcut={false}
      >
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/dark:dark/)
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("atlas-theme")).toBeNull()
    unmount()

    document.documentElement.classList.remove("dark")
    localStorage.setItem("kairos-theme", "light")

    render(
      <ThemeProvider
        storageKey="kairos-theme"
        defaultTheme="dark"
        enableSystem={false}
        enableShortcut={false}
      >
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    expect(document.documentElement).toHaveClass("light")
  })

  it("toggles light and dark with the d shortcut", async () => {
    const user = createUser()
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    await user.keyboard("d")
    await waitForTheme(/dark:dark/)
    expect(localStorage.getItem("atlas-theme")).toBe("dark")
    expect(document.documentElement).toHaveClass("dark")

    await user.keyboard("D")
    await waitForTheme(/light:light/)
    expect(localStorage.getItem("atlas-theme")).toBe("light")
  })

  it("does not toggle while typing in an input", async () => {
    const user = createUser()
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <label htmlFor="title">Title</label>
        <input id="title" />
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    await user.click(screen.getByLabelText("Title"))
    await user.keyboard("d")

    expect(screen.getByLabelText("Title")).toHaveValue("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("does not toggle while typing in a textarea", async () => {
    const user = createUser()
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" />
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    await user.click(screen.getByLabelText("Notes"))
    await user.keyboard("d")

    expect(screen.getByLabelText("Notes")).toHaveValue("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
  })

  it("leaves d to Select typeahead instead of toggling the theme", async () => {
    function MonthSelect() {
      const [month, setMonth] = useState("")
      return (
        <>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger aria-label="Month">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jan">January</SelectItem>
              <SelectItem value="dec">December</SelectItem>
            </SelectContent>
          </Select>
          <p data-testid="month">{month}</p>
        </>
      )
    }

    const user = createUser()
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <MonthSelect />
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    screen.getByRole("combobox", { name: "Month" }).focus()
    await user.keyboard("d")

    await waitFor(() => {
      expect(screen.getByTestId("month")).toHaveTextContent("dec")
    })
    expect(themeOutput()).toHaveTextContent(/light:light/)
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("does not toggle when a focused control already handled the key", async () => {
    const user = createUser()
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <button
          type="button"
          onKeyDown={(event) => {
            if (event.key === "d") event.preventDefault()
          }}
        >
          Duplicate
        </button>
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    screen.getByRole("button", { name: "Duplicate" }).focus()
    await user.keyboard("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
  })

  it("ignores the shortcut when enableShortcut is false", async () => {
    const user = createUser()
    render(
      <ThemeProvider
        defaultTheme="light"
        enableSystem={false}
        enableShortcut={false}
      >
        <ThemeProbe />
      </ThemeProvider>
    )

    await waitForTheme(/light:light/)
    await user.keyboard("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
  })
})
