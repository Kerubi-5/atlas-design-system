import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Calendar } from "../../src/calendar.js"
import { formatLocalDate } from "../../src/date-picker.js"
import { CalendarStory } from "../../stories/calendar.js"

type Args = { selected: string }
const meta = {
  title: "Components/Calendar",
  args: { selected: "2026-10-09" },
  argTypes: {
    selected: {
      control: "text",
      description: "Local calendar date in yyyy-MM-dd format",
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const selected = args.selected
      ? new Date(`${args.selected}T00:00:00`)
      : undefined
    return (
      <Calendar
        mode="single"
        selected={selected}
        month={selected}
        onSelect={(date) =>
          updateArgs({ selected: date ? formatLocalDate(date) : "" })
        }
      />
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const SingleDay: Story = {
  render: () => <CalendarStory />,
  parameters: { controls: { disable: true } },
}
