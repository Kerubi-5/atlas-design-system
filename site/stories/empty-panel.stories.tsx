import type { Meta, StoryObj } from "@storybook/react-vite"

import { EmptyPanel } from "../../src/empty-panel.js"
import { EmptyPanelStory } from "../../stories/display.js"

const meta = {
  title: "Feedback/Empty panel",
  component: EmptyPanel,
  args: {
    children: "Nothing to show",
    size: "md",
    muted: true,
  },
  argTypes: {
    children: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    muted: { control: "boolean" },
  },
} satisfies Meta<typeof EmptyPanel>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Sizes: Story = {
  render: () => <EmptyPanelStory />,
  parameters: { controls: { disable: true } },
}
