// Accessibility gate: every Storybook story, in light and dark, must pass
// axe-core's WCAG 2.2 A and AA rules. Run after `npm run build` with
// `npm run test:a11y`; CI installs Chromium first (`npx playwright install`).
import assert from "node:assert/strict"
import test from "node:test"

import {
  PHONE,
  THEMES,
  assertNoProblems,
  inBatches,
  indexEntries,
  openStory,
  runAxe,
  storyIndex,
  violationMessage,
  withSite,
} from "./browser.mjs"
import { OVERLAYS, openOverlay } from "./overlays.mjs"

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
      await openOverlay(page, overlay)
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
    const problems = violations.map((violation) =>
      violationMessage(`${label} [${theme}]`, violation)
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

/** Each overlay opened and audited in both themes, one after another. */
async function auditOverlays(context, baseUrl, index, overlays) {
  const found = []
  for (const overlay of overlays) {
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
}

test("every story passes WCAG 2.2 AA checks in light and dark", async () => {
  const stories = await indexEntries()

  const problems = await withSite(({ context, baseUrl }) =>
    inBatches(
      stories.flatMap((entry) =>
        THEMES.map((theme) => () => auditStory(context, baseUrl, entry, theme))
      )
    )
  )

  assertNoProblems(problems, "accessibility violations")
})

test("open overlays pass WCAG 2.2 AA checks in light and dark", async () => {
  const index = await storyIndex()
  for (const { id } of OVERLAYS) {
    assert.ok(index.entries[id], `${id} is in the story index`)
  }
  const problems = await withSite(({ context, baseUrl }) =>
    auditOverlays(context, baseUrl, index, OVERLAYS)
  )
  assertNoProblems(problems, "accessibility violations")
})

test("audited controls pass WCAG 2.2 AA at 390px in both themes", async () => {
  const index = await storyIndex()
  const affected =
    /^(actions-button|overlays-info-tip|layout-card|navigation-tabs|navigation-nav-link|forms-combobox|forms-search-picker|forms-calendar|forms-date-picker|forms-date-time-picker|overlays-dialog|feedback-toast)--/
  const stories = await indexEntries("story", affected)
  const problems = await withSite(
    async ({ context, baseUrl }) => {
      const found = []
      for (const entry of stories) {
        for (const theme of THEMES)
          found.push(...(await auditStory(context, baseUrl, entry, theme)))
      }
      found.push(
        ...(await auditOverlays(
          context,
          baseUrl,
          index,
          OVERLAYS.filter(({ id }) => affected.test(id))
        ))
      )
      return found
    },
    { viewport: PHONE }
  )
  assertNoProblems(problems, "accessibility violations")
})
