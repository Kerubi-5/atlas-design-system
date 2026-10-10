import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton } from "../../src/skeleton.js"
import { SkeletonAndSeparatorStory } from "../../stories/display.js"

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  args: { className: "h-4 w-48" },
  argTypes: { className: { control: "text" } },
} satisfies Meta<typeof Skeleton>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Loading: Story = {
  render: () => <SkeletonAndSeparatorStory />,
  parameters: { controls: { disable: true } },
}
