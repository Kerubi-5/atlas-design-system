// Shared browser plumbing for the site tests: Storybook iframe URLs, the
// settle sequence before anything is sampled, axe-core, and one static
// server plus Chromium bootstrap. The node:test files and the Playwright
// specs both import it, so everything here takes a Playwright `page`.
import fs from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"

import { chromium } from "playwright"

import { distDir, serve } from "./serve.mjs"

const require = createRequire(import.meta.url)

export const THEMES = ["light", "dark"]
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const NO_MOTION =
  "*, *::before, *::after { transition: none !important; animation: none !important; }"

/** The story's own root; overlays portal outside it. */
export const storyRoot = (page) => page.locator("#storybook-root")

/** The built site's story index (`dist/index.json`). */
export async function storyIndex() {
  return JSON.parse(await fs.readFile(path.join(distDir, "index.json"), "utf8"))
}

/**
 * Path of a story, or its docs page, in the preview iframe, relative to the
 * site root. `args` is Storybook's `name:value;name:value` URL form.
 */
export function storyUrl(
  id,
  { theme = "light", viewMode = "story", args } = {}
) {
  const query = `id=${id}&viewMode=${viewMode}&globals=theme:${theme}`
  return `/iframe.html?${query}${args ? `&args=${args}` : ""}`
}

/**
 * Finish transitions now, so colours are not sampled mid-animation, then let
 * fonts swap and effects that depend on layout (Table's overflow check) run
 * before sampling; under parallel load they can lag a frame.
 */
export async function settle(page) {
  await page.addStyleTag({ content: NO_MOTION })
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )
    await new Promise((resolve) => setTimeout(resolve, 300))
  })
}

/**
 * Load a story in `theme` and settle it. The Playwright specs pass "" as
 * `baseUrl`; their `page.goto` resolves against the configured baseURL.
 * Resolves true when Storybook showed its error display instead.
 */
export async function openStory(
  page,
  baseUrl,
  id,
  theme = "light",
  { args } = {}
) {
  await page.goto(`${baseUrl}${storyUrl(id, { theme, args })}`)
  await page.waitForFunction(
    () => /sb-show-main|sb-show-errordisplay/.test(document.body.className),
    null,
    { timeout: 20_000 }
  )
  const errored = await page.evaluate(() =>
    document.body.className.includes("sb-show-errordisplay")
  )
  if (!errored) await settle(page)
  return errored
}

let axeSource

/**
 * Run axe-core's WCAG 2.2 A and AA rules on the story root, or on the whole
 * page (`wholePage`, for overlays that portal outside the root). `rules` is
 * axe's per-rule options, for a rule the caller replaces with its own check.
 * Returns the violations as { id, help, targets }.
 */
export async function runAxe(page, { wholePage = false, rules = {} } = {}) {
  axeSource ??= await fs.readFile(
    require.resolve("axe-core/axe.min.js"),
    "utf8"
  )
  await page.addScriptTag({ content: axeSource })
  return page.evaluate(
    async ({ tags, wholePage, rules }) => {
      // Storybook's a11y panel runs axe on each render; wait for that run.
      let result
      for (let attempt = 0; ; attempt += 1) {
        try {
          result = await window.axe.run(
            wholePage ? document : document.querySelector("#storybook-root"),
            {
              runOnly: { type: "tag", values: tags },
              resultTypes: ["violations"],
              rules,
            }
          )
          break
        } catch (error) {
          if (!String(error).includes("already running") || attempt > 50) {
            throw error
          }
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }
      return result.violations.map((violation) => ({
        id: violation.id,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      }))
    },
    { tags: WCAG_TAGS, wholePage, rules }
  )
}

/**
 * Serve the built site and launch Chromium with one context (1280×900,
 * reduced motion, plus `contextOptions`). `fn` gets { browser, context,
 * baseUrl }; browser and server close afterwards, also when `fn` throws.
 */
export async function withSite(fn, contextOptions = {}) {
  const server = await serve(distDir)
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 },
      ...contextOptions,
    })
    return await fn({ browser, context, baseUrl })
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
}
