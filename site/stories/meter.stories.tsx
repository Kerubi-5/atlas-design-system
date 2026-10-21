import type { Meta, StoryObj } from "@storybook/react-vite"

import { Meter } from "../../src/meter.js"
import { MeterStory, spendMarkers, spendMeter } from "../../stories/meter.js"

const meta = {
  title: "Data display/Meter",
  component: Meter,
  args: spendMeter,
  argTypes: {
    value: { control: { type: "number", min: 0, max: 200 } },
    max: { control: { type: "number", min: 1 } },
    fillClassName: { control: "text" },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Meter {...args} markers={spendMarkers} />
    </div>
  ),
} satisfies Meta<typeof Meter>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const WithMarkers: Story = {
  render: () => <MeterStory />,
  parameters: { controls: { disable: true } },
}
