import { defineConfig } from "@playwright/test"

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
    baseURL: "http://127.0.0.1:4400",
    viewport: { width: 900, height: 700 },
    deviceScaleFactor: 1,
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
    command: "node tests/serve.mjs 4400",
    url: "http://127.0.0.1:4400/iframe.html",
    reuseExistingServer: !process.env.CI,
  },
})
