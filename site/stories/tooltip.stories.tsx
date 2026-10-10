import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Button } from "../../src/button.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../src/tooltip.js"
import { TooltipStory } from "../../stories/menus.js"

type Args = {
  open: boolean
  content: string
  side: "top" | "right" | "bottom" | "left"
}

const meta = {
  title: "Overlays/Tooltip",
  args: { open: false, content: "Copy link", side: "top" },
  argTypes: {
    open: { control: "boolean" },
    content: { control: "text" },
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <div className="flex min-h-32 items-center justify-center">
        <Tooltip open={args.open} onOpenChange={(open) => updateArgs({ open })}>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline">
              Hover or focus me
            </Button>
          </TooltipTrigger>
          <TooltipContent side={args.side}>{args.content}</TooltipContent>
        </Tooltip>
      </div>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const IconButtons: Story = {
  render: () => <TooltipStory />,
  parameters: { controls: { disable: true } },
}
