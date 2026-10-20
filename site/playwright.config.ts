import { defineConfig } from "@playwright/test"

/** Where `tests/serve.mjs` serves the built site for the screenshots. */
const port = 4400
const origin = `http://127.0.0.1:${port}`

/**
 * Screenshot tests for the built Storybook site. Build first
 * (`npm run build`), then `npm run test:visual`; refresh baselines after an
 * intended visual change with `npm run test:visual:update`.
 */
export default defineConfig({
  testDir: "tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{platform}{ext}",
  fullyParallel: true,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: origin,
    viewport: { width: 900, height: 700 },
    deviceScaleFactor: 1,
    // Grayscale, unhinted text on every machine. Hosts whose fontconfig turns
    // on subpixel (LCD) text, like GitHub's runners, otherwise draw colored
    // glyph edges that no baseline from another machine matches.
    launchOptions: {
      args: ["--disable-lcd-text", "--font-render-hinting=none"],
    },
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      // Absorbs anti-aliasing noise between machines, not layout changes.
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `node tests/serve.mjs ${port}`,
    url: `${origin}/iframe.html`,
    reuseExistingServer: !process.env.CI,
  },
})
