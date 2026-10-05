"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes"

const EDITABLE_SELECTOR =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])"

export type ThemeProviderProps = NextThemesProviderProps & {
  /**
   * When true, pressing `d` toggles dark/light unless focus is in an editable
   * field. Defaults to true.
   */
  enableShortcut?: boolean
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest(EDITABLE_SELECTOR))
}

/** Listens for the optional `d` shortcut inside an existing theme context. */
function ThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key !== "d" && event.key !== "D") return
      if (isEditableTarget(event.target)) return
      event.preventDefault()
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}

/**
 * Class-based theme wrapper around `next-themes`. Does not require Next.js;
 * pass `storageKey` from the application (`atlas-theme` is the kit default).
 */
function ThemeProvider({
  children,
  storageKey = "atlas-theme",
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = true,
  enableShortcut = true,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      storageKey={storageKey}
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {enableShortcut ? <ThemeShortcut /> : null}
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider, useTheme }
