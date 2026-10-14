import { expect, test } from "@playwright/test"

const controls = [
  ["actions-button--variants", "[data-slot=button]:not(:disabled)"],
  ["overlays-info-tip--layouts", "[data-slot=info-tip-trigger]"],
  ["navigation-tabs--composition", "[data-slot=tabs-trigger]"],
  ["navigation-tabs--nav", "[data-slot=tabs-list] a"],
  ["forms-combobox--playground", "[role=combobox]"],
  ["forms-search-picker--example", "input"],
  ["forms-calendar--single-day", "[data-slot=button]:not(:disabled)"],
  ["overlays-dialog--playground", "[data-slot=dialog-close-button]"],
  ["feedback-toast--plain", "[data-close-button]"],
] as const

for (const width of [1280, 390]) {
  for (const theme of ["light", "dark"]) {
    test(`controls expose visible focus and 24px targets at ${width} ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const [id, selector] of controls) {
        await page.goto(
          `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`
        )
        const root = page.locator("#storybook-root")
        await expect(root).toBeVisible()
        await page.addStyleTag({
          content:
            "*, *::before, *::after { transition: none !important; animation: none !important; }",
        })
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
          const box = await inline.boundingBox()
          expect(box).not.toBeNull()
          await page.mouse.click(box!.x - 8, box!.y + box!.height / 2)
          await expect(page.getByRole("dialog")).toBeVisible()
        }
        if (id === "navigation-tabs--nav" && width === 390) {
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
