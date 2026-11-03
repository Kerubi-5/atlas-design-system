import { expect, test, type Page } from "@playwright/test"

import { DESKTOP, openStory } from "../browser.mjs"

/**
 * The finish zone is in the DOM at opacity 0 and aria-hidden until a drag
 * starts. Playwright `dragTo` presses, then waits for the target locator
 * before moving. `getByRole("region", { name: "Drop here to finish" })`
 * does not match an aria-hidden node, so that wait never ends. Pass
 * `includeHidden: true`, or target `[data-slot="kanban-action-zone"]`.
 */

function body(page: Page, name: string) {
  return page
    .locator('[data-slot="kanban-card"]')
    .filter({ hasText: name })
    .locator('[data-slot="kanban-card-body"]')
}

test.describe("Kanban finish-zone drop", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height })
    await openStory(page, "", "data-display-kanban--rail")
  })

  test("the finish region stays hidden until a drag starts", async ({
    page,
  }) => {
    const finish = page.getByRole("region", { name: "Drop here to finish" })
    await expect(finish).toHaveCount(0)
    const hidden = page.getByRole("region", {
      name: "Drop here to finish",
      includeHidden: true,
    })
    await expect(hidden).toHaveCount(1)
    await expect(hidden).toHaveAttribute("aria-hidden", "true")

    const card = body(page, "Harbor Coffee")
    const box = await card.boundingBox()
    if (!box) throw new Error("card body has no layout box")
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await expect(finish).toHaveCount(0)
    await page.mouse.up()
  })

  test("a force dragTo onto the hidden finish zone completes the card", async ({
    page,
  }) => {
    const card = body(page, "Harbor Coffee")
    const finish = page.getByRole("region", {
      name: "Drop here to finish",
      includeHidden: true,
    })
    await card.dragTo(finish, { force: true })
    await expect(card).toHaveCount(0)
  })

  test("a force dragTo onto the finish slot completes the card", async ({
    page,
  }) => {
    const card = body(page, "Harbor Coffee")
    const finish = page.locator('[data-slot="kanban-action-zone"]').filter({
      hasText: "Finish",
    })
    await card.dragTo(finish, { force: true })
    await expect(card).toHaveCount(0)
  })

  test("stepped mouse moves onto the finish zone complete the card", async ({
    page,
  }) => {
    const card = body(page, "Harbor Coffee")
    const finish = page.locator('[data-slot="kanban-action-zone"]').filter({
      hasText: "Finish",
    })
    const from = await card.boundingBox()
    const to = await finish.boundingBox()
    if (!from || !to) throw new Error("missing layout boxes")
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
    await page.mouse.down()
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
      steps: 12,
    })
    await page.mouse.up()
    await expect(card).toHaveCount(0)
  })
})
