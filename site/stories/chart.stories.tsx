import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChartStory } from "../../stories/chart.js"

const meta = {
  title: "Data display/Chart",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const SpendLine: Story = { render: () => <ChartStory /> }
