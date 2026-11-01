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
  ["data-display-kanban--board", "[data-slot=kanban-card-actions]"],
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

test("SearchPicker keeps keyboard navigation after a pointer selection", async ({
  page,
}) => {
  await openStory(page, "", "forms-search-picker--example")
  const input = page.getByRole("combobox", { name: "Place" })
  await input.fill("East")
  await page.getByRole("option", { name: "East ward" }).click()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue("")
  const before = await input.getAttribute("aria-activedescendant")
  await page.keyboard.press("ArrowDown")
  await expect(input).not.toHaveAttribute("aria-activedescendant", before!)
  const activeId = await input.getAttribute("aria-activedescendant")
  await page.keyboard.press("Enter")
  await expect(page.locator(`[role=option][id="${activeId}"]`)).toHaveAttribute(
    "aria-selected",
    "true"
  )
})

for (const picker of [
  "forms-search-picker--example",
  "forms-combobox--playground",
]) {
  test(`${picker} preserves Shift+Home text selection`, async ({ page }) => {
    await openStory(page, "", picker)
    if (picker === "forms-combobox--playground")
      await page.getByRole("combobox").click()
    const input = page.locator("input").first()
    await input.fill("test")
    await input.press("End")
    await input.press("Shift+Home")
    expect(
      await input.evaluate((element) => ({
        start: element.selectionStart,
        end: element.selectionEnd,
      }))
    ).toEqual({ start: 0, end: 4 })
  })
}

for (const width of WIDTHS) {
  test(`Kanban actions move, reorder, and remove cards without dragging at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: DESKTOP.height })
    await openStory(page, "", "data-display-kanban--board")
    const card = () =>
      page
        .locator('[data-slot="kanban-card"]')
        .filter({ hasText: "Harbor Coffee" })
    const action = () => card().getByRole("button", { name: "Card actions" })
    await action().click()
    await page.getByRole("menuitem", { name: "Move down", exact: true }).click()
    await expect(
      page
        .locator('[data-slot="kanban-column"]')
        .first()
        .locator('[data-slot="kanban-card-body"]')
    ).toHaveText(["North Clinic", "Harbor Coffee"])
    await expect(action()).toBeFocused()
    await action().click()
    await page
      .getByRole("menuitem", { name: "Move to Talking", exact: true })
      .click()
    await expect(
      page
        .locator('[data-slot="kanban-column"]')
        .nth(1)
        .locator('[data-slot="kanban-card-body"]')
    ).toHaveText(["Pine Studio", "Harbor Coffee"])
    await expect(action()).toBeFocused()
    await action().press("Enter")
    await page
      .getByRole("menuitem", { name: "Move to Won", exact: true })
      .focus()
    await page.keyboard.press("Enter")
    await expect(
      page
        .locator('[data-slot="kanban-column"]')
        .nth(2)
        .locator('[data-slot="kanban-card-body"]')
    ).toHaveText(["Harbor Coffee"])
    await expect(action()).toBeFocused()
    await action().click()
    await page.getByRole("menuitem", { name: "Remove", exact: true }).click()
    await expect(card()).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Card actions" }).first()
    ).toBeFocused()
  })
}

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
