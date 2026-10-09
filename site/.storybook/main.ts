import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  core: { disableTelemetry: true },
  async viteFinal(config) {
    // Relative preview chunks work both at /storybook/ and in the dev server.
    config.base = "./"
    return config
  },
}

export default config
