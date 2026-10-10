import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "../../src/badge.js"
import { Button } from "../../src/button.js"

const meta = {
  title: "Components/Theme provider",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Every story is wrapped with ThemeProvider. The kit `d` shortcut is off here so it does not fight the Storybook theme toolbar.",
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Toolbar: Story = {
  render: () => (
    <div className="grid max-w-md gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Use the theme toolbar to switch light and dark. Tokens, type, and the
        selected wash should match what consuming apps see with{" "}
        <code className="bg-muted px-1">theme.css</code> and ThemeProvider.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button">Save</Button>
        <Button type="button" variant="outline">
          Clear selection
        </Button>
        <Badge variant="soft" tone="success">
          Paid
        </Badge>
      </div>
      <div className="bg-selected px-3 py-2 text-sm text-selected-foreground">
        Selected wash
      </div>
    </div>
  ),
}
