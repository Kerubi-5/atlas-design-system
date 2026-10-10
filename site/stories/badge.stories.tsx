import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge } from "../../src/badge.js"
import { BadgeVariantsStory } from "../../stories/badge.js"

const meta = {
  title: "Data display/Badge",
  component: Badge,
  args: { children: "Paid", variant: "soft", tone: "success" },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
        "soft",
      ],
    },
    tone: {
      control: "select",
      options: ["neutral", "success", "warning", "destructive"],
    },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Variants: Story = {
  render: () => <BadgeVariantsStory />,
  parameters: { controls: { disable: true } },
}
