import type { PropsWithChildren } from "react"
import type { Preview, ReactRenderer } from "@storybook/react-vite"
import {
  DocsContainer,
  type DocsContainerProps,
} from "@storybook/addon-docs/blocks"
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
    // CI runs axe on every story (tests/a11y.test.mjs); show failures as errors.
    a11y: { test: "error" },
    docs: {
      // One Toaster per docs page. The story decorator skips its own in docs
      // mode, or every story on the page would show the same toast.
      container: ({
        children,
        ...props
      }: PropsWithChildren<DocsContainerProps>) => (
        <DocsContainer {...props}>
          {children}
          <Toaster />
        </DocsContainer>
      ),
    },
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
        {context.viewMode === "docs" ? null : <Toaster />}
      </ThemeProvider>
    ),
  ],
}

export default preview
