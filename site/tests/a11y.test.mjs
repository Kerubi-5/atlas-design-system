// Accessibility gate: every Storybook story, in light and dark, must pass
// axe-core's WCAG 2.2 A and AA rules. Run after `npm run build` with
// `npm run test:a11y`; CI installs Chromium first (`npx playwright install`).
import assert from "node:assert/strict"
import test from "node:test"

import { THEMES, openStory, runAxe, storyIndex, withSite } from "./browser.mjs"
import { OVERLAYS } from "./overlays.mjs"

const CONCURRENCY = 4

/**
 * Overlays render in portals and only after interaction, so the per-story
 * pass never sees them. Each entry of OVERLAYS is opened here and the whole
 * page is scanned.
 *
 * Open overlays hide the page behind them with aria-hidden. axe's
 * aria-hidden-focus rule cannot tell that focus is trapped unless the overlay
 * is an aria-modal dialog, which menus and listboxes cannot be, so for open
 * overlays that rule is replaced by the behavior it guards: Tab and
 * Shift+Tab must never put focus inside hidden content.
 */
async function auditStory(context, baseUrl, entry, theme, overlay) {
  const page = await context.newPage()
  try {
    if (await openStory(page, baseUrl, entry.id, theme)) {
      return [`${entry.id} [${theme}]: story failed to render`]
    }
    if (overlay) {
      await overlay.open(page)
      await page.waitForSelector(overlay.shows, {
        state: "visible",
        timeout: 10_000,
      })
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 300))
      )
    }
    const violations = await runAxe(
      page,
      overlay
        ? {
            wholePage: true,
            rules: { "aria-hidden-focus": { enabled: false } },
          }
        : {}
    )

    const label = overlay ? `${entry.id} (open)` : entry.id
    const problems = violations.map(
      (violation) =>
        `${label} [${theme}]: ${violation.id} (${violation.help}) at ${violation.targets.slice(0, 3).join(", ")}`
    )
    if (overlay) {
      for (const key of ["Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab"]) {
        await page.keyboard.press(key)
        const hidden = await page.evaluate(() => {
          const active = document.activeElement
          return active?.closest('[aria-hidden="true"]')
            ? active.outerHTML.slice(0, 80)
            : null
        })
        if (hidden) {
          problems.push(
            `${label} [${theme}]: ${key} moved focus into hidden content: ${hidden}`
          )
        }
      }
    }
    return problems
  } finally {
    await page.close()
  }
}

test("every story passes WCAG 2.2 AA checks in light and dark", async () => {
  const index = await storyIndex()
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story"
  )
  assert.ok(stories.length > 0, "index.json lists stories")

  const problems = await withSite(async ({ context, baseUrl }) => {
    const jobs = stories.flatMap((entry) =>
      THEMES.map((theme) => () => auditStory(context, baseUrl, entry, theme))
    )
    const found = []
    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
      const batch = await Promise.all(
        jobs.slice(i, i + CONCURRENCY).map((job) => job())
      )
      found.push(...batch.flat())
    }
    return found
  })

  assert.deepEqual(
    problems,
    [],
    `${problems.length} accessibility violations:\n${problems.join("\n")}`
  )
})

test("open overlays pass WCAG 2.2 AA checks in light and dark", async () => {
  const index = await storyIndex()
  for (const { id } of OVERLAYS) {
    assert.ok(index.entries[id], `${id} is in the story index`)
  }
  const problems = await withSite(async ({ context, baseUrl }) => {
    const found = []
    for (const overlay of OVERLAYS) {
      for (const theme of THEMES) {
        found.push(
          ...(await auditStory(
            context,
            baseUrl,
            index.entries[overlay.id],
            theme,
            overlay
          ))
        )
      }
    }
    return found
  })
  assert.deepEqual(
    problems,
    [],
    `${problems.length} accessibility violations:\n${problems.join("\n")}`
  )
})

test("audited controls pass WCAG 2.2 AA at 390px in both themes", async () => {
  const index = await storyIndex()
  const affected =
    /^(actions-button|overlays-info-tip|layout-card|navigation-tabs|navigation-nav-link|forms-combobox|forms-search-picker|forms-calendar|forms-date-picker|forms-date-time-picker|overlays-dialog|feedback-toast)--/
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story" && affected.test(entry.id)
  )
  assert.ok(stories.length > 0)
  const problems = await withSite(
    async ({ context, baseUrl }) => {
      const found = []
      for (const entry of stories) {
        for (const theme of THEMES)
          found.push(...(await auditStory(context, baseUrl, entry, theme)))
      }
      for (const overlay of OVERLAYS.filter(({ id }) => affected.test(id))) {
        for (const theme of THEMES)
          found.push(
            ...(await auditStory(
              context,
              baseUrl,
              index.entries[overlay.id],
              theme,
              overlay
            ))
          )
      }
      return found
    },
    { viewport: { width: 390, height: 844 } }
  )
  assert.deepEqual(problems, [], problems.join("\n"))
})
