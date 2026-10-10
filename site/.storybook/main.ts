import path from "node:path"
import { fileURLToPath } from "node:url"

import type { StorybookConfig } from "@storybook/react-vite"

const siteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const repoRoot = path.resolve(siteRoot, "..")

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  core: { disableTelemetry: true },
  async viteFinal(config) {
    // Relative preview chunks work at the site root and in the dev server.
    config.base = "./"
    config.server = {
      ...config.server,
      fs: { allow: [repoRoot] },
    }
    return config
  },
}

export default config
