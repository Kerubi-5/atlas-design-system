import { expect, test } from "@playwright/test"

import {
  DESKTOP,
  PHONE,
  THEMES,
  WIDTHS,
  openStory,
  storyRoot,
} from "../browser.mjs"

const controls = [
  ["actions-button--variants", "[data-slot=button]:not(:disabled)"],
  ["overlays-info-tip--layouts", "[data-slot=info-tip-trigger]"],
  ["navigation-tabs--composition", "[data-slot=tabs-trigger]"],
  ["navigation-tabs--nav", "[data-slot=tabs-list] a"],
  ["navigation-nav-link--shell", "[data-slot=nav-link]"],
  ["forms-combobox--playground", "[role=combobox]"],
  ["forms-search-picker--example", "input"],
  ["forms-calendar--single-day", "[data-slot=button]:not(:disabled)"],
  ["overlays-dialog--playground", "[data-slot=dialog-close-button]"],
  ["feedback-toast--plain", "[data-close-button]"],
] as const

for (const width of WIDTHS) {
  for (const theme of THEMES) {
    test(`controls expose visible focus and 24px targets at ${width} ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: DESKTOP.height })
      for (const [id, selector] of controls) {
        await openStory(page, "", id, theme)
        const root = storyRoot(page)
        await expect(root).toBeVisible()
        if (id === "overlays-dialog--playground")
          await root.getByRole("button").first().click()
        const targets = page.locator(selector)
        await expect(targets.first()).toBeVisible()
        // Keyboard modality, then focus each control rather than relying on
        // story-specific tab order. This exercises the shipped CSS in Chromium.
        await page.keyboard.press("Tab")
        for (const target of await targets.all()) {
          if (!(await target.isVisible())) continue
          await target.focus()
          const metrics = await target.evaluate((element) => {
            const style = getComputedStyle(element)
            const after = getComputedStyle(element, "::after")
            const bounds = element.getBoundingClientRect()
            return {
              width: Math.max(
                bounds.width,
                after.content !== "none" ? parseFloat(after.width) || 0 : 0
              ),
              height: Math.max(
                bounds.height,
                after.content !== "none" ? parseFloat(after.height) || 0 : 0
              ),
              focusVisible: element.matches(":focus-visible"),
              shadow: style.boxShadow,
              offset: style.getPropertyValue("--tw-ring-offset-width"),
            }
          })
          expect(metrics.width, `${id} width`).toBeGreaterThanOrEqual(24)
          expect(metrics.height, `${id} height`).toBeGreaterThanOrEqual(24)
          expect(metrics.focusVisible, `${id} keyboard focus`).toBe(true)
          expect(metrics.shadow, `${id} focus ring`).not.toBe("none")
          expect(metrics.offset.trim(), `${id} focus separation`).toBe("2px")
        }
        if (id === "overlays-info-tip--layouts") {
          const inline = page
            .locator("[data-slot=info-tip-trigger][data-layout=inline]")
            .first()
          // The glyph scales with the sentence and leaves its line height.
          const fit = await inline.evaluate((element) => {
            const line = element.closest("p")!
            const style = getComputedStyle(line)
            return {
              glyph: element.getBoundingClientRect().height,
              fontSize: parseFloat(style.fontSize),
              line: line.getBoundingClientRect().height,
              lineHeight: parseFloat(style.lineHeight),
            }
          })
          expect(fit.glyph, "inline tip glyph").toBeLessThanOrEqual(
            fit.fontSize
          )
          // A whole number of lines: the sentence may wrap at 390px.
          const lines = fit.line / fit.lineHeight
          expect(lines, "inline tip line height").toBe(Math.round(lines))
          const box = await inline.boundingBox()
          expect(box).not.toBeNull()
          await page.mouse.click(box!.x - 8, box!.y + box!.height / 2)
          await expect(page.getByRole("dialog")).toBeVisible()
        }
        if (id === "navigation-tabs--nav" && width === PHONE.width) {
          const cue = await page
            .locator("[data-slot=tabs-scroller]")
            .evaluate((element) => ({
              overflowing: element.scrollWidth > element.clientWidth,
              fade: getComputedStyle(element).backgroundImage,
            }))
          expect(cue.overflowing).toBe(true)
          expect(cue.fade).toContain("linear-gradient")
        }
      }
    })
  }
}
