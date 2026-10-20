import { type ComponentProps, type ReactNode, useState } from "react"
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

/**
 * `children` and the probe in a light ThemeProvider without the system
 * theme; `props` override those defaults.
 */
function renderThemed(
  props: Partial<ComponentProps<typeof ThemeProvider>> = {},
  children?: ReactNode
) {
  return render(
    <ThemeProvider defaultTheme="light" enableSystem={false} {...props}>
      {children}
      <ThemeProbe />
    </ThemeProvider>
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
    renderThemed({ defaultTheme: "dark" })

    await waitForTheme(/dark:dark/)
    expect(document.documentElement).toHaveClass("dark")
  })

  it("reads and writes a custom storage key", async () => {
    localStorage.setItem("kairos-theme", "dark")

    const { unmount } = renderThemed({ storageKey: "kairos-theme" })

    await waitForTheme(/dark:dark/)
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("atlas-theme")).toBeNull()
    unmount()

    document.documentElement.classList.remove("dark")
    localStorage.setItem("kairos-theme", "light")

    renderThemed({ storageKey: "kairos-theme", defaultTheme: "dark" })

    await waitForTheme(/light:light/)
    expect(document.documentElement).toHaveClass("light")
  })

  it("toggles light and dark with the d shortcut", async () => {
    const user = createUser()
    renderThemed({ enableShortcut: true })

    await waitForTheme(/light:light/)
    await user.keyboard("d")
    await waitForTheme(/dark:dark/)
    expect(localStorage.getItem("atlas-theme")).toBe("dark")
    expect(document.documentElement).toHaveClass("dark")

    await user.keyboard("D")
    await waitForTheme(/light:light/)
    expect(localStorage.getItem("atlas-theme")).toBe("light")
  })

  it.each([
    ["an input", "input"],
    ["a textarea", "textarea"],
  ] as const)("does not toggle while typing in %s", async (_, Control) => {
    const user = createUser()
    renderThemed(
      { enableShortcut: true },
      <>
        <label htmlFor="field">Field</label>
        <Control id="field" />
      </>
    )

    await waitForTheme(/light:light/)
    await user.click(screen.getByLabelText("Field"))
    await user.keyboard("d")

    expect(screen.getByLabelText("Field")).toHaveValue("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
    expect(document.documentElement).not.toHaveClass("dark")
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
    renderThemed({ enableShortcut: true }, <MonthSelect />)

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
    renderThemed(
      { enableShortcut: true },
      <button
        type="button"
        onKeyDown={(event) => {
          if (event.key === "d") event.preventDefault()
        }}
      >
        Duplicate
      </button>
    )

    await waitForTheme(/light:light/)
    screen.getByRole("button", { name: "Duplicate" }).focus()
    await user.keyboard("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
  })

  it("leaves the d shortcut off unless the app turns it on", async () => {
    // A single-key shortcut needs a user-facing off switch (WCAG 2.1.4).
    const user = createUser()
    renderThemed()

    await waitForTheme(/light:light/)
    await user.keyboard("d")
    expect(themeOutput()).toHaveTextContent(/light:light/)
  })
})
