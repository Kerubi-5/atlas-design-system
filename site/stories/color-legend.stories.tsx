import type { Meta, StoryObj } from "@storybook/react-vite"

import { ColorLegend } from "../../src/color-legend.js"
import {
  ColorLegendStory,
  depthScale,
  legendFrame,
} from "../../stories/color-legend.js"

const meta = {
  title: "Data display/Color legend",
  component: ColorLegend,
  args: depthScale,
  argTypes: {
    title: { control: "text" },
    caption: { control: "text" },
    items: { control: "object" },
  },
  render: (args) => <ColorLegend {...args} className={legendFrame} />,
} satisfies Meta<typeof ColorLegend>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Scale: Story = {
  render: () => <ColorLegendStory />,
  parameters: { controls: { disable: true } },
}
