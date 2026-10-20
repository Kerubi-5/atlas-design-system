import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge } from "../../src/badge.js"
import { BadgeVariantsStory } from "../../stories/badge.js"
import { controlOptions } from "../src/lib/controls.js"

type Props = React.ComponentProps<typeof Badge>

const meta = {
  title: "Data display/Badge",
  component: Badge,
  args: { children: "Paid", variant: "soft", tone: "success" },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: controlOptions<NonNullable<Props["variant"]>>({
        default: true,
        secondary: true,
        destructive: true,
        outline: true,
        ghost: true,
        link: true,
        soft: true,
      }),
    },
    tone: {
      control: "select",
      options: controlOptions<NonNullable<Props["tone"]>>({
        neutral: true,
        success: true,
        warning: true,
        destructive: true,
      }),
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
