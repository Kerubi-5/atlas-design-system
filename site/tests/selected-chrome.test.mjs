// Selected Toggle / ToggleGroup chrome: wash + selected-foreground text and
// border (WCAG 1.4.11). Class-string kit tests cannot see computed CSS, so
// this loads the built stories in Chromium. Run after `npm run build` with
// `npm run test:a11y`; CI installs Chromium first.
import assert from "node:assert/strict"
import test from "node:test"

import { chromium } from "playwright"

import { distDir, serve } from "./serve.mjs"

const stories = [
  {
    id: "components-toggle-group--playground",
    selected: { role: "radio", name: "List" },
  },
  {
    id: "components-toggle--variants",
    selected: { role: "button", name: "Italic" },
  },
]

function parseRgb(value) {
  const match = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(value)
  assert.ok(match, `parse color: ${value}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

test("selected Toggle and ToggleGroup use the wash and selected border", async () => {
  const browser = await chromium.launch()
  const server = await serve(distDir)
  const port = server.address().port
  try {
    for (const theme of ["light", "dark"]) {
      for (const story of stories) {
        const page = await browser.newPage()
        await page.goto(
          `http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`
        )
        await page.waitForSelector("body.sb-show-main")
        await page.evaluate(() => document.fonts.ready)
        const measured = await page.evaluate((selected) => {
          const el = document.querySelector(
            `[role="${selected.role}"][aria-label="${selected.name}"], [role="${selected.role}"]`
          )
          const named = [
            ...document.querySelectorAll(`[role="${selected.role}"]`),
          ].find(
            (node) =>
              node.getAttribute("aria-label") === selected.name ||
              node.textContent?.trim() === selected.name
          )
          const target = named ?? el
          if (!target) return { missing: true }
          const styles = getComputedStyle(target)
          const probe = document.createElement("div")
          document.body.append(probe)
          const token = (property, value) => {
            probe.style[property] = value
            return getComputedStyle(probe)[property]
          }
          const result = {
            missing: false,
            background: styles.backgroundColor,
            color: styles.color,
            border: styles.borderTopColor,
            selected: token("backgroundColor", "var(--selected)"),
            selectedForeground: token("color", "var(--selected-foreground)"),
            primary: token("backgroundColor", "var(--primary)"),
            transparent: "rgba(0, 0, 0, 0)",
          }
          probe.remove()
          return result
        }, story.selected)
        await page.close()

        assert.equal(
          measured.missing,
          false,
          `${story.id} [${theme}]: selected control is in the story`
        )
        const background = parseRgb(measured.background)
        const selected = parseRgb(measured.selected)
        const selectedForeground = parseRgb(measured.selectedForeground)
        const primary = parseRgb(measured.primary)
        const color = parseRgb(measured.color)
        const border = parseRgb(measured.border)

        assert.notEqual(
          measured.background,
          measured.transparent,
          `${story.id} [${theme}]: selected fill is not transparent`
        )
        assert.ok(
          distance(background, selected) < 12,
          `${story.id} [${theme}]: fill ${measured.background} should be the selected wash ${measured.selected}`
        )
        assert.ok(
          distance(background, primary) > 40,
          `${story.id} [${theme}]: fill is the wash, not solid primary ${measured.primary}`
        )
        assert.ok(
          background[0] - background[2] < 20,
          `${story.id} [${theme}]: fill is not pink (${measured.background})`
        )
        assert.ok(
          distance(color, selectedForeground) < 12,
          `${story.id} [${theme}]: text ${measured.color} should be selected-foreground ${measured.selectedForeground}`
        )
        assert.ok(
          distance(border, selectedForeground) < 12,
          `${story.id} [${theme}]: border ${measured.border} should be selected-foreground ${measured.selectedForeground}`
        )
      }
    }
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
})
