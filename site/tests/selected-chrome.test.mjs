// Selected Toggle / ToggleGroup chrome: wash + selected-foreground text and
// border (WCAG 1.4.11). Class-string kit tests cannot see computed CSS, so
// this loads the built stories in Chromium. Run after `npm run build` with
// `npm run test:a11y`; CI installs Chromium first.
import assert from "node:assert/strict"
import test from "node:test"

import { THEMES, openStory, withSite } from "./browser.mjs"

const stories = [
  {
    id: "actions-toggle-group--playground",
    selected: { role: "radio", name: "List" },
  },
  {
    id: "actions-toggle--variants",
    selected: { role: "button", name: "Italic" },
  },
]

test("selected Toggle and ToggleGroup use the wash and selected border", async () => {
  await withSite(async ({ context, baseUrl }) => {
    for (const theme of THEMES) {
      for (const story of stories) {
        const page = await context.newPage()
        await openStory(page, baseUrl, story.id, theme)
        if (theme === "dark") {
          await page.waitForFunction(() =>
            Boolean(document.querySelector(".dark"))
          )
        }
        const measured = await page.evaluate((selected) => {
          const named = [
            ...document.querySelectorAll(
              `[role="${selected.role}"], ${selected.role}`
            ),
          ].find(
            (node) =>
              node.getAttribute("aria-label") === selected.name ||
              node.textContent?.trim() === selected.name
          )
          if (!named) return { missing: true }

          const probe = document.createElement("div")
          const canvas = document.createElement("canvas")
          canvas.width = 1
          canvas.height = 1
          named.append(probe, canvas)
          const ctx = canvas.getContext("2d", { willReadFrequently: true })
          const rgb = (cssColor) => {
            probe.style.color = cssColor
            ctx.clearRect(0, 0, 1, 1)
            ctx.fillStyle = getComputedStyle(probe).color
            ctx.fillRect(0, 0, 1, 1)
            return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)]
          }
          const styles = getComputedStyle(named)
          const result = {
            missing: false,
            background: rgb(styles.backgroundColor),
            color: rgb(styles.color),
            border: rgb(styles.borderTopColor),
            selected: rgb("var(--selected)"),
            selectedForeground: rgb("var(--selected-foreground)"),
            primary: rgb("var(--primary)"),
            transparent:
              styles.backgroundColor === "rgba(0, 0, 0, 0)" ||
              styles.backgroundColor === "transparent",
          }
          probe.remove()
          canvas.remove()
          return result
        }, story.selected)
        await page.close()

        const label = `${story.id} [${theme}]`
        assert.equal(
          measured.missing,
          false,
          `${label}: selected control is in the story`
        )
        assert.equal(
          measured.transparent,
          false,
          `${label}: selected fill is not transparent`
        )

        const distance = (a, b) =>
          Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

        assert.ok(
          distance(measured.background, measured.selected) < 12,
          `${label}: fill ${measured.background} should be the selected wash ${measured.selected}`
        )
        assert.ok(
          distance(measured.background, measured.primary) > 40,
          `${label}: fill is the wash, not solid primary ${measured.primary}`
        )
        assert.ok(
          measured.background[0] - measured.background[2] < 20,
          `${label}: fill is not pink (${measured.background})`
        )
        assert.ok(
          distance(measured.color, measured.selectedForeground) < 12,
          `${label}: text ${measured.color} should be selected-foreground ${measured.selectedForeground}`
        )
        assert.ok(
          distance(measured.border, measured.selectedForeground) < 12,
          `${label}: border ${measured.border} should be selected-foreground ${measured.selectedForeground}`
        )
      }
    }
  })
})
