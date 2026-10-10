import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { ToggleGroup, ToggleGroupItem } from "../../src/toggle-group.js"
import { ToggleGroupStory } from "../../stories/selection.js"

type Args = { value: string }
const meta = {
  title: "Components/Toggle group",
  args: { value: "list" },
  argTypes: {
    value: { control: "select", options: ["list", "board", "chart"] },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <ToggleGroup
        type="single"
        variant="outline"
        value={args.value}
        onValueChange={(value) => {
          if (value) updateArgs({ value })
        }}
      >
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="chart">Chart</ToggleGroupItem>
      </ToggleGroup>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <ToggleGroupStory />,
  parameters: { controls: { disable: true } },
}
