import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { DatePickerButton, formatLocalDate } from "../../src/date-picker.js"
import { Label } from "../../src/label.js"
import { DatePickerRangeStory } from "../../stories/date-picker-range.js"

type Args = {
  value: string
  placeholder: string
  disabled: boolean
  numberOfMonths: number
}
const meta = {
  title: "Components/Date picker",
  args: {
    value: "2026-10-09",
    placeholder: "Pick a date",
    disabled: false,
    numberOfMonths: 1,
  },
  argTypes: {
    value: {
      control: "text",
      description: "Local calendar date in yyyy-MM-dd format",
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    numberOfMonths: { control: { type: "number", min: 1, max: 3 } },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>As of</Label>
        <DatePickerButton
          {...args}
          id={id}
          onChange={(date) =>
            updateArgs({ value: date ? formatLocalDate(date) : "" })
          }
        />
      </div>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Empty: Story = { args: { value: "" } }
export const Disabled: Story = { args: { disabled: true } }
export const RangeReference: Story = {
  render: () => <DatePickerRangeStory />,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Existing fixed range example for responsive layout checks. Use the viewport toolbar to compare one and two months.",
      },
    },
  },
}
