import type { Meta, StoryObj } from "@storybook/react-vite"

import { InfoTip } from "../../src/info-tip.js"
import { InfoTipStory } from "../../stories/info-tip.js"

const meta = {
  title: "Components/Info tip",
  component: InfoTip,
  args: {
    label: "About this field",
    title: "Depth",
    description: "Height of standing water at this point.",
    layout: "box",
    side: "top",
    align: "center",
  },
  argTypes: {
    label: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    layout: { control: "select", options: ["box", "inline"] },
    side: { control: "select", options: ["top", "right", "bottom", "left"] },
    align: { control: "select", options: ["start", "center", "end"] },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center">
      <InfoTip {...args} />
    </div>
  ),
} satisfies Meta<typeof InfoTip>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Layouts: Story = {
  render: () => <InfoTipStory />,
  parameters: { controls: { disable: true } },
}
