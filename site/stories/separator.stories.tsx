import type { Meta, StoryObj } from "@storybook/react-vite"

import { Separator } from "../../src/separator.js"
import { SkeletonAndSeparatorStory } from "../../stories/display.js"

const meta = {
  title: "Components/Separator",
  component: Separator,
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
  render: (args) => (
    <div
      className={
        args.orientation === "vertical"
          ? "flex h-16 items-center gap-3"
          : "grid max-w-sm gap-3"
      }
    >
      <p className="text-sm">Above</p>
      <Separator {...args} />
      <p className="text-sm">Below</p>
    </div>
  ),
} satisfies Meta<typeof Separator>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const WithSkeleton: Story = {
  render: () => <SkeletonAndSeparatorStory />,
  parameters: { controls: { disable: true } },
}
