import type { Meta, StoryObj } from "@storybook/react-vite"
import { Calendar } from "../../src/calendar.js"
import { CalendarStory } from "../../stories/calendar.js"

const meta = {
  title: "Examples/Calendar",
  component: Calendar,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Calendar>
export default meta
type Story = StoryObj<typeof meta>
export const SingleDay: Story = { render: () => <CalendarStory /> }
