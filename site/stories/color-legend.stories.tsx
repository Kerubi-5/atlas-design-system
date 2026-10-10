import type { Meta, StoryObj } from "@storybook/react-vite"

import { ColorLegend } from "../../src/color-legend.js"
import { ColorLegendStory } from "../../stories/color-legend.js"

const items = [
  { color: "#1d4ed8", range: "2+", label: "Deep" },
  { color: "#3b82f6", range: "1–2", label: "Moderate" },
  { color: "#93c5fd", range: "0–1", label: "Shallow" },
]

const meta = {
  title: "Components/Color legend",
  component: ColorLegend,
  args: {
    title: "Depth",
    "aria-label": "Depth scale",
    caption: "Heights in metres",
    items,
  },
  argTypes: {
    title: { control: "text" },
    caption: { control: "text" },
    items: { control: "object" },
  },
  render: (args) => (
    <ColorLegend
      {...args}
      className="max-w-xs border border-border bg-card p-3"
    />
  ),
} satisfies Meta<typeof ColorLegend>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Scale: Story = {
  render: () => <ColorLegendStory />,
  parameters: { controls: { disable: true } },
}
