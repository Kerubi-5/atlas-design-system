import themeSource from "../../../theme.css?raw"

export type CssVar = {
  name: string
  value: string
}

export type TokenSection = {
  id: string
  title: string
  description: string
  vars: CssVar[]
}

type ThemeTokens = {
  colors: CssVar[]
  darkColors: CssVar[]
  type: CssVar[]
  spacing: CssVar[]
}

/**
 * Pull custom properties from a CSS block such as `:root { ... }`.
 */
export function parseCssVars(block: string): CssVar[] {
  const vars: CssVar[] = []
  const seen = new Set<string>()
  const pattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(block))) {
    const name = `--${match[1]}`
    const value = match[2]?.trim() ?? ""
    if (seen.has(name)) continue
    seen.add(name)
    vars.push({ name, value })
  }

  return vars
}

/**
 * Body of the rule whose prelude is exactly `selector` (`:root`, `.dark`,
 * `@theme inline`). The prelude must start a rule, so `.dark` inside
 * `@custom-variant dark (&:is(.dark *))` does not match.
 */
function extractBlock(css: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = new RegExp(`(?:^|[;{}]|\\*\\/)\\s*${escaped}\\s*\\{`).exec(css)
  if (!match) return ""
  const open = match.index + match[0].length - 1

  let depth = 0
  for (let i = open; i < css.length; i++) {
    const char = css[i]
    if (char === "{") depth += 1
    else if (char === "}") {
      depth -= 1
      if (depth === 0) return css.slice(open + 1, i)
    }
  }

  return ""
}

function isRadiusVar(name: string) {
  return name === "--radius" || name.startsWith("--radius-")
}

function isTypeVar(name: string) {
  return name.startsWith("--font-")
}

/**
 * Semantic color, type, and radius tokens from `theme.css`.
 * Color names stay in sync as tokens are added to `:root`.
 */
export function loadThemeTokens(): ThemeTokens {
  const rootVars = parseCssVars(extractBlock(themeSource, ":root"))
  const darkVars = parseCssVars(extractBlock(themeSource, ".dark"))
  const themeVars = parseCssVars(extractBlock(themeSource, "@theme inline"))

  return {
    colors: rootVars.filter((item) => !isRadiusVar(item.name)),
    darkColors: darkVars.filter((item) => !isRadiusVar(item.name)),
    type: themeVars.filter((item) => isTypeVar(item.name)),
    spacing: [
      ...rootVars.filter((item) => isRadiusVar(item.name)),
      ...themeVars.filter((item) => isRadiusVar(item.name)),
    ],
  }
}

export const spacingScale = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const

export const typeSamples = [
  {
    id: "heading",
    label: "Heading",
    className: "font-heading text-base font-semibold tracking-wider uppercase",
    sample: "Card title",
  },
  {
    id: "button",
    label: "Button / toggle",
    className: "text-xs font-semibold tracking-widest uppercase",
    sample: "Save changes",
  },
  {
    id: "label",
    label: "Label",
    className: "text-xs font-semibold tracking-wide uppercase",
    sample: "Email address",
  },
  {
    id: "body",
    label: "Body",
    className: "text-sm leading-relaxed",
    sample: "Semantic colors, square corners, distinct selected states.",
  },
  {
    id: "muted",
    label: "Muted",
    className: "text-sm leading-relaxed text-muted-foreground",
    sample: "Helper copy and empty-state hints.",
  },
] as const
