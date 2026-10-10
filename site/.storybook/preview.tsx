import type { Preview, ReactRenderer } from "@storybook/react-vite"
import { withThemeByClassName } from "@storybook/addon-themes"
import { MINIMAL_VIEWPORTS } from "storybook/viewport"

const atlasViewports = {
  ...MINIMAL_VIEWPORTS,
  phone390: {
    name: "390",
    styles: { width: "390px", height: "844px" },
    type: "mobile" as const,
  },
}

import { ThemeProvider } from "../../src/theme-provider.js"
import { Toaster } from "../../src/sonner.js"
import "../src/styles.css"

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    viewport: { options: atlasViewports },
    options: {
      storySort: { order: ["Docs", "Tokens", "Components", "Examples"] },
    },
    a11y: { test: "todo" },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story, context) => (
      <ThemeProvider
        forcedTheme={context.globals.theme ?? "light"}
        enableShortcut={false}
        enableSystem={false}
        storageKey="atlas-storybook-theme"
      >
        <div className="min-h-40 bg-background p-6 text-foreground">
          <Story />
        </div>
        <Toaster />
      </ThemeProvider>
    ),
  ],
}

export default preview
