import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../src/card.js"
import {
  CardContentPx0Story,
  FlexColumnCardsStory,
} from "../../stories/card-layout.js"

type Args = {
  title: string
  description: string
  body: string
  size: "default" | "sm"
  flush: boolean
}

const meta = {
  title: "Layout/Card",
  component: Card,
  args: {
    title: "Profile",
    description: "Shared card chrome with square corners.",
    body: "Body that must not collapse to a title strip.",
    size: "default",
    flush: false,
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    body: { control: "text" },
    size: { control: "select", options: ["default", "sm"] },
    flush: { control: "boolean" },
  },
  render: (args) => (
    <Card size={args.size} flush={args.flush} className="max-w-md">
      <CardHeader>
        <CardTitle>{args.title}</CardTitle>
        <CardDescription>{args.description}</CardDescription>
      </CardHeader>
      <CardContent>{args.body}</CardContent>
    </Card>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const FlexColumn: Story = {
  render: () => <FlexColumnCardsStory />,
  parameters: { controls: { disable: true } },
}
export const FullBleed: Story = {
  render: () => <CardContentPx0Story />,
  parameters: { controls: { disable: true } },
}
