import type { PropsWithChildren } from "react"
import type { Preview, ReactRenderer } from "@storybook/react-vite"
import {
  Controls,
  Description,
  DocsContainer,
  type DocsContainerProps,
  Heading,
  Markdown,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
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
import { beta, usage } from "../src/lib/usage.js"
import "../src/styles.css"

/** "Usage" guidance for the component this docs page documents. */
function UsageBlock() {
  const { preparedMeta } = useOf("meta", ["meta"])
  // Titles are "<Group>/<Name>"; guidance is keyed by the component name.
  const name = preparedMeta.title.split("/").at(-1) ?? ""
  const guidance = usage[name]
  if (!guidance) return null
  const status = beta.has(name)
    ? "**Status: beta.** The API may still change in a minor release.\n\n"
    : ""
  return (
    <>
      <Heading>Usage</Heading>
      <div className="markdown">
        <Markdown>{status + guidance}</Markdown>
      </div>
    </>
  )
}

/** Storybook's default autodocs page with a Usage section after the description. */
function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <UsageBlock />
      <Primary />
      <Controls />
      <Stories />
    </>
  )
}

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    viewport: { options: atlasViewports },
    options: {
      // Component pages are grouped by purpose; the build test keeps every
      // component story in one of these groups.
      storySort: {
        order: [
          "Docs",
          "Foundations",
          "Actions",
          "Forms",
          "Navigation",
          "Feedback",
          "Overlays",
          "Data display",
          "Layout",
          "Examples",
        ],
      },
    },
    // CI runs axe on every story (tests/a11y.test.mjs); show failures as errors.
    a11y: { test: "error" },
    docs: {
      page: DocsPage,
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
