import type { Meta, StoryObj } from "@storybook/react-vite"

import { StatTile } from "../../src/stat-tile.js"
import { StatTileStory } from "../../stories/stat-tile.js"

const meta = {
  title: "Components/Stat tile",
  component: StatTile,
  args: {
    label: "Spent",
    value: "1,240",
    sub: "of 2,000 this month",
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    sub: { control: "text" },
  },
} satisfies Meta<typeof StatTile>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Row: Story = {
  render: () => <StatTileStory />,
  parameters: { controls: { disable: true } },
}
