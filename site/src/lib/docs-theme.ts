import { create, themes, type ThemeVars } from "storybook/theming"

export type SiteTheme = "light" | "dark"

/**
 * Storybook's docs blocks (descriptions, props tables, controls, source
 * panels) take their colors from a Storybook theme object, not from CSS, and
 * mix them with `polished`, which cannot parse `oklch()` or `var()`. Read each
 * kit token under the requested theme and hand Storybook the resolved sRGB
 * value, so docs chrome follows theme.css in light and dark.
 */
function readTokens(theme: SiteTheme, names: string[]) {
  const probe = document.createElement("span")
  probe.hidden = true
  if (theme === "dark") probe.className = "dark"
  document.body.append(probe)
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const paint = canvas.getContext("2d", { willReadFrequently: true })
  const values: Record<string, string | undefined> = {}
  for (const name of names) {
    const raw = getComputedStyle(probe).getPropertyValue(name).trim()
    if (!raw || !paint) continue
    // Resolve nested var()/color-mix() through a real color property.
    probe.style.color = raw
    const color = getComputedStyle(probe).color
    paint.clearRect(0, 0, 1, 1)
    paint.fillStyle = color
    paint.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = paint.getImageData(0, 0, 1, 1).data
    values[name] =
      `rgba(${r}, ${g}, ${b}, ${Math.round(((a ?? 255) / 255) * 100) / 100})`
  }
  probe.remove()
  return values
}

const cache = new Map<SiteTheme, ThemeVars>()

/** A Storybook docs theme built from the kit tokens for `theme`. */
export function docsTheme(theme: SiteTheme): ThemeVars {
  const cached = cache.get(theme)
  if (cached) return cached
  const fallback = themes[theme]
  const t = readTokens(theme, [
    "--background",
    "--foreground",
    "--muted",
    "--muted-foreground",
    "--border",
    "--input",
    "--primary",
    "--selected-foreground",
  ])
  // Unresolved tokens (stylesheet not applied yet) keep Storybook's color and
  // are not cached, so the next render reads them again.
  const complete = Object.keys(t).length === 8
  const value = create({
    base: theme,
    colorPrimary: t["--primary"] ?? fallback.colorPrimary,
    // Storybook draws docs links in the secondary color; the kit's link
    // color is selected-foreground, AA on the page in both themes.
    colorSecondary: t["--selected-foreground"] ?? fallback.colorSecondary,
    appBg: t["--background"] ?? fallback.appBg,
    appContentBg: t["--background"] ?? fallback.appContentBg,
    appHoverBg: t["--muted"] ?? fallback.appHoverBg,
    appPreviewBg: t["--background"] ?? fallback.appPreviewBg,
    appBorderColor: t["--border"] ?? fallback.appBorderColor,
    appBorderRadius: 0,
    fontBase: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    fontCode:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    textColor: t["--foreground"] ?? fallback.textColor,
    textInverseColor: t["--background"] ?? fallback.textInverseColor,
    textMutedColor: t["--muted-foreground"] ?? fallback.textMutedColor,
    barTextColor: t["--muted-foreground"] ?? fallback.barTextColor,
    barHoverColor: t["--foreground"] ?? fallback.barHoverColor,
    barSelectedColor: t["--foreground"] ?? fallback.barSelectedColor,
    barBg: t["--muted"] ?? fallback.barBg,
    buttonBg: t["--muted"] ?? fallback.buttonBg,
    buttonBorder: t["--input"] ?? fallback.buttonBorder,
    booleanBg: t["--muted"] ?? fallback.booleanBg,
    booleanSelectedBg: t["--background"] ?? fallback.booleanSelectedBg,
    inputBg: t["--background"] ?? fallback.inputBg,
    inputBorder: t["--input"] ?? fallback.inputBorder,
    inputTextColor: t["--foreground"] ?? fallback.inputTextColor,
    inputBorderRadius: 0,
  })
  if (complete) cache.set(theme, value)
  return value
}
