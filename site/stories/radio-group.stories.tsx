import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Label } from "../../src/label.js"
import { RadioGroup, RadioGroupItem } from "../../src/radio-group.js"
import { RadioGroupStory } from "../../stories/choices.js"

type Args = { value: string; disabled: boolean }
const options = ["Daily", "Weekly", "Monthly"]

const meta = {
  title: "Forms/Radio group",
  args: { value: "Weekly", disabled: false },
  argTypes: {
    value: { control: "select", options },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <RadioGroup
        value={args.value}
        disabled={args.disabled}
        onValueChange={(value) => updateArgs({ value })}
        aria-label="Export frequency"
      >
        {options.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <RadioGroupItem value={option} id={`playground-${option}`} />
            <Label htmlFor={`playground-${option}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <RadioGroupStory />,
  parameters: { controls: { disable: true } },
}
