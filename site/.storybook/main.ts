import path from "node:path"
import { fileURLToPath } from "node:url"

import type { StorybookConfig } from "@storybook/react-vite"

const siteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const repoRoot = path.resolve(siteRoot, "..")

const config = {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  core: { disableTelemetry: true },
  // Manager HTML title is `${title} - Storybook`. manager.ts rewrites the live
  // document.title so the tab reads Atlas React Kit.
  title: "Atlas React Kit",
  // Storybook links public/favicon.svg itself; iOS home screens need a PNG.
  managerHead: (head) =>
    `${head}<link rel="apple-touch-icon" href="./apple-touch-icon.png" />`,
  async viteFinal(config) {
    // Relative preview chunks work at the site root and in the dev server.
    config.base = "./"
    config.server = {
      ...config.server,
      fs: { allow: [repoRoot] },
    }
    return config
  },
} satisfies StorybookConfig & { title: string }

export default config
