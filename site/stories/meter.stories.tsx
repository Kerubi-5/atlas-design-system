import type { Meta, StoryObj } from "@storybook/react-vite"

import { Meter } from "../../src/meter.js"
import { MeterStory } from "../../stories/meter.js"

const meta = {
  title: "Components/Meter",
  component: Meter,
  args: {
    value: 72,
    max: 100,
    "aria-label": "Spend against limit",
    fillClassName: "bg-warning",
  },
  argTypes: {
    value: { control: { type: "number", min: 0, max: 200 } },
    max: { control: { type: "number", min: 1 } },
    fillClassName: { control: "text" },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Meter
        {...args}
        markers={[
          { position: 80 },
          { position: 50, className: "w-0.5 bg-foreground" },
        ]}
      />
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
