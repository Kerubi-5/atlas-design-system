import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Avatar, AvatarFallback, AvatarImage } from "../../src/avatar.js"
import { AvatarStory } from "../../stories/content.js"

type Args = {
  size: React.ComponentProps<typeof Avatar>["size"]
  src: string
  initials: string
}

const meta = {
  title: "Data display/Avatar",
  component: Avatar,
  args: { size: "default", src: "./favicon.svg", initials: "AT" },
  argTypes: {
    size: { control: "select" },
    src: { control: "text" },
    initials: { control: "text" },
  },
  render: (args) => (
    <Avatar size={args.size}>
      <AvatarImage src={args.src} alt="" />
      <AvatarFallback>{args.initials}</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Sizes: Story = {
  render: () => <AvatarStory />,
  parameters: { controls: { disable: true } },
}
