import type { Meta, StoryObj } from "@storybook/react-vite"

import { TokensPage } from "../src/tokens-page.js"

const meta = {
  title: "Tokens",
  tags: ["!autodocs"],
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Colors, type, and spacing parsed from theme.css. Use the theme toolbar for light and dark.",
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Theme: Story = {
  render: () => <TokensPage />,
}
