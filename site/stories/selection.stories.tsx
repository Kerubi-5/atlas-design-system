import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  CheckboxStory,
  ToggleStory,
  ToggleGroupStory,
} from "../../stories/selection.js"

const meta = {
  title: "Examples/Selection",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Checkbox: Story = { render: () => <CheckboxStory /> }
export const Toggle: Story = { render: () => <ToggleStory /> }
export const ToggleGroup: Story = { render: () => <ToggleGroupStory /> }
