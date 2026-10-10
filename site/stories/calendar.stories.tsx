import { useEffect, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Calendar } from "../../src/calendar.js"
import { formatLocalDate, toDate } from "../../src/date-picker.js"
import { CalendarStory } from "../../stories/calendar.js"

type Args = { selected: string }

/**
 * Month state lives here, not in the story function: a state update there
 * re-runs the story function outside Storybook's render, and `useArgs`
 * throws.
 */
function CalendarPlayground({
  selected,
  onSelect,
}: {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}) {
  const selectedTime = selected?.getTime()
  const [month, setMonth] = useState(selected)
  // Show the month of a date typed into the control; arrows still navigate.
  useEffect(() => {
    if (selectedTime !== undefined) setMonth(new Date(selectedTime))
  }, [selectedTime])
  return (
    <Calendar
      mode="single"
      selected={selected}
      month={month}
      onMonthChange={setMonth}
      onSelect={onSelect}
    />
  )
}

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
    return (
      <CalendarPlayground
        // toDate returns undefined for partial input while the control is typed.
        selected={toDate(args.selected)}
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
