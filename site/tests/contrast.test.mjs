// Token contrast gate: text pairs need 4.5:1 (WCAG 1.4.3); control
// boundaries, checked fills, state borders, and the focus ring need 3:1
// against what they sit on (WCAG 1.4.11). Colors are resolved and composited
// by Chromium from theme.css, in light and dark, so oklch, color-mix, and
// opacity modifiers count exactly as they render. axe (tests/a11y.test.mjs)
// covers text in rendered stories; it does not check non-text contrast.
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)
const TEXT = 4.5
const UI = 3

const tint = (token, percent) =>
  `color-mix(in oklab, var(--${token}) ${percent}%, transparent)`
const on = (...layers) => layers
const page = on("var(--background)")
const card = on("var(--card)")
const wash = on("var(--background)", "var(--selected)")

// [what, foreground, background layers (bottom first), minimum]
const pairs = [
  ["body text", "var(--foreground)", page, TEXT],
  ["card text", "var(--card-foreground)", card, TEXT],
  ["popover text", "var(--popover-foreground)", on("var(--popover)"), TEXT],
  [
    "primary button text",
    "var(--primary-foreground)",
    on("var(--primary)"),
    TEXT,
  ],
  [
    "secondary button text",
    "var(--secondary-foreground)",
    on("var(--secondary)"),
    TEXT,
  ],
  ["muted text on the page", "var(--muted-foreground)", page, TEXT],
  ["muted text on a card", "var(--muted-foreground)", card, TEXT],
  ["muted text on muted", "var(--muted-foreground)", on("var(--muted)"), TEXT],
  ["accent text", "var(--accent-foreground)", on("var(--accent)"), TEXT],
  ["selected text on the wash", "var(--selected-foreground)", wash, TEXT],
  ["selected text on the page", "var(--selected-foreground)", page, TEXT],
  ["selected text on a card", "var(--selected-foreground)", card, TEXT],
  ["body text on the wash", "var(--foreground)", wash, TEXT],
  ["inactive tab text", tint("foreground", 60), on("var(--muted)"), TEXT],
  ...["destructive", "success", "warning"].flatMap((tone) => [
    [`${tone} text on the page`, `var(--${tone})`, page, TEXT],
    [`${tone} text on a card`, `var(--${tone})`, card, TEXT],
    [
      `${tone} text on its /10 tint`,
      `var(--${tone})`,
      on("var(--background)", tint(tone, 10)),
      TEXT,
    ],
    [
      `${tone} text on its /15 tint`,
      `var(--${tone})`,
      on("var(--background)", tint(tone, 15)),
      TEXT,
    ],
  ]),
  ["field border on the page", "var(--input)", page, UI],
  ["field border on a card", "var(--input)", card, UI],
  [
    "switch thumb on the off track",
    "var(--background)",
    on("var(--input)"),
    UI,
  ],
  ["checked fill on the page", "var(--primary)", page, UI],
  ["checked fill on a card", "var(--primary)", card, UI],
  ["selected border on the wash", "var(--selected-foreground)", wash, UI],
  ["selected border on the page", "var(--selected-foreground)", page, UI],
  ["focus ring on the page", "var(--ring)", page, UI],
  ["focus ring on a card", "var(--ring)", card, UI],
  ["focus ring on muted", "var(--ring)", on("var(--muted)"), UI],
  ["focus ring on the wash", "var(--ring)", wash, UI],
  [
    "menu highlight bar on accent",
    "var(--ring)",
    on("var(--popover)", "var(--accent)"),
    UI,
  ],
]

test("theme tokens meet WCAG contrast in light and dark", async () => {
  const theme = await fs.readFile(path.join(repoRoot, "theme.css"), "utf8")
  const tokens = [...theme.matchAll(/^(:root|\.dark) \{[\s\S]*?\n\}/gm)]
    .map((match) => match[0])
    .join("\n")
  assert.match(tokens, /\.dark \{/, "theme.css has light and dark tokens")

  const browser = await chromium.launch()
  try {
    const tab = await browser.newPage()
    await tab.setContent(
      `<style>${tokens}</style><div id="probe"></div><canvas id="c" width="1" height="1"></canvas>`
    )
    const results = await tab.evaluate((pairs) => {
      const probe = document.getElementById("probe")
      const ctx = document
        .getElementById("c")
        .getContext("2d", { willReadFrequently: true })
      const paint = (layers) => {
        ctx.clearRect(0, 0, 1, 1)
        for (const layer of layers) {
          probe.style.color = ""
          probe.style.color = layer
          ctx.fillStyle = getComputedStyle(probe).color
          ctx.fillRect(0, 0, 1, 1)
        }
        return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)]
      }
      const luminance = (rgb) =>
        rgb
          .map((value) => {
            const c = value / 255
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
          })
          .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
      const out = []
      for (const theme of ["light", "dark"]) {
        document.documentElement.className = theme === "dark" ? "dark" : ""
        for (const [what, foreground, background, min] of pairs) {
          const [hi, lo] = [
            luminance(paint([...background, foreground])),
            luminance(paint(background)),
          ].sort((a, b) => b - a)
          out.push({ theme, what, min, ratio: (hi + 0.05) / (lo + 0.05) })
        }
      }
      return out
    }, pairs)

    const failures = results
      .filter((result) => result.ratio < result.min)
      .map(
        (result) =>
          `${result.what} [${result.theme}]: ${result.ratio.toFixed(2)}:1, needs ${result.min}:1`
      )
    assert.deepEqual(failures, [], failures.join("\n"))
  } finally {
    await browser.close()
  }
})
