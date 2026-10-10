import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { format } from "date-fns"

import { toDate } from "../../src/date-picker.js"
import { DateTimePickerButton } from "../../src/date-time-picker.js"
import { Label } from "../../src/label.js"
import { DateTimePickerStory } from "../../stories/date-time-picker.js"

type Args = {
  value: string
  placeholder: string
  disabled: boolean
  timeStep: number
}

const meta = {
  title: "Forms/Date time picker",
  args: {
    value: "2026-10-10T14:30",
    placeholder: "Pick a date and time",
    disabled: false,
    timeStep: 15,
  },
  argTypes: {
    value: {
      control: "text",
      description: "Local date-time in yyyy-MM-ddTHH:mm format",
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    timeStep: { control: { type: "number", min: 1, max: 60, step: 1 } },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    const date = toDate(args.value) ?? null
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>Starts</Label>
        <DateTimePickerButton
          id={id}
          value={date}
          placeholder={args.placeholder}
          disabled={args.disabled}
          timeStep={args.timeStep}
          onChange={(next) =>
            updateArgs({
              value: next ? format(next, "yyyy-MM-dd'T'HH:mm") : "",
            })
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
export const Phone390: Story = {
  render: () => <DateTimePickerStory />,
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "phone390" },
    docs: {
      description: {
        story:
          "Fixed example for the 390 viewport. Open the popover and confirm the calendar and time row stay on-screen.",
      },
    },
  },
}
