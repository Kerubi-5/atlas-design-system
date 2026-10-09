import { MoonIcon, SunIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "../../../src/button.js"
import { useTheme } from "../../../src/theme-provider.js"

/** Visible light/dark control; ThemeProvider still toggles on the `d` key. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dark = mounted && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
