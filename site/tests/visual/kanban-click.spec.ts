import { expect, test, type Locator, type Page } from "@playwright/test"

import { DESKTOP, openStory } from "../browser.mjs"

/** Matches `CARD_POINTER_DISTANCE` in the kit's Kanban pointer sensor. */
const CARD_POINTER_DISTANCE = 5

function column(page: Page, label: string) {
  return page.locator('[data-slot="kanban-column"]').filter({
    has: page.getByText(label, { exact: true }),
  })
}

function body(page: Page, name: string) {
  return page
    .locator('[data-slot="kanban-card"]')
    .filter({ hasText: name })
    .locator('[data-slot="kanban-card-body"]')
}

/**
 * Count native click events on the card body. The board story's
 * `onCardClick` is a no-op, so the click landing is the signal that the
 * handler would have run.
 */
async function watchClicks(target: Locator) {
  await target.evaluate((element) => {
    element.dataset.clickCount = "0"
    element.addEventListener("click", () => {
      element.dataset.clickCount = String(
        Number(element.dataset.clickCount) + 1
      )
    })
  })
}

async function clickCount(target: Locator) {
  return Number((await target.getAttribute("data-click-count")) ?? "0")
}

async function centerOf(target: Locator) {
  const box = await target.boundingBox()
  if (!box) throw new Error("card body has no layout box")
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

test.describe("Kanban card click vs drag", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: DESKTOP.width, height: DESKTOP.height })
    await openStory(page, "", "data-display-kanban--board")
  })

  test("a mouse click without movement opens the card once", async ({
    page,
  }) => {
    const card = body(page, "Harbor Coffee")
    await watchClicks(card)
    await card.click()
    expect(await clickCount(card)).toBe(1)
    await expect(column(page, "New")).toContainText("Harbor Coffee")
  })

  test("jitter under the drag distance still opens the card", async ({
    page,
  }) => {
    const card = body(page, "Harbor Coffee")
    await watchClicks(card)
    const start = await centerOf(card)
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(start.x + 3, start.y + 1, { steps: 2 })
    await page.mouse.up()
    expect(await clickCount(card)).toBe(1)
    await expect(column(page, "New")).toContainText("Harbor Coffee")
  })

  test("dragging past the distance does not open the card", async ({
    page,
  }) => {
    const card = body(page, "Harbor Coffee")
    await watchClicks(card)
    const start = await centerOf(card)
    const past = CARD_POINTER_DISTANCE + 3
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(start.x + past, start.y + past, { steps: 4 })
    await page.mouse.up()
    expect(await clickCount(card)).toBe(0)
    await expect(column(page, "New")).toContainText("Harbor Coffee")
  })

  test("keyboard Enter still opens the card", async ({ page }) => {
    const card = body(page, "Harbor Coffee")
    await watchClicks(card)
    await card.focus()
    await page.keyboard.press("Enter")
    expect(await clickCount(card)).toBe(1)
  })
})
