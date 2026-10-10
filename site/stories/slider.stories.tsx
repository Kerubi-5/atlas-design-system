import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"

import { Label } from "../../src/label.js"
import { Slider } from "../../src/slider.js"
import { SliderStory } from "../../stories/slider.js"

const meta = {
  title: "Forms/Slider",
  component: Slider,
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <div className="grid max-w-sm gap-2">
        <div className="flex items-center justify-between">
          <Label id="story-slider-label">Chance</Label>
          <span className="text-sm text-muted-foreground tabular-nums">
            {args.value}%
          </span>
        </div>
        <Slider
          {...args}
          id="story-slider"
          aria-labelledby="story-slider-label"
          onValueChange={(value) => {
            args.onValueChange(value)
            updateArgs({ value })
          }}
        />
      </div>
    )
  },
} satisfies Meta<typeof Slider>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Labelled: Story = {
  render: () => <SliderStory />,
  parameters: { controls: { disable: true } },
}
