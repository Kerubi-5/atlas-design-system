import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Button } from "../../src/button.js"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../../src/popover.js"
import { PopoverStory } from "../../stories/overlays.js"

type Args = {
  open: boolean
  title: string
  description: string
  triggerLabel: string
}

const meta = {
  title: "Overlays/Popover",
  args: {
    open: false,
    title: "Shortcuts",
    description: "Use the theme toolbar to switch light and dark.",
    triggerLabel: "Open popover",
  },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    triggerLabel: { control: "text" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Popover open={args.open} onOpenChange={(open) => updateArgs({ open })}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline">
            {args.triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>{args.title}</PopoverTitle>
            <PopoverDescription>{args.description}</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <PopoverStory />,
  parameters: { controls: { disable: true } },
}
