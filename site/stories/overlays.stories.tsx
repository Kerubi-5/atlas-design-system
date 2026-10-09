import type { Meta, StoryObj } from "@storybook/react-vite"
import { PopoverStory, ToastStory } from "../../stories/overlays.js"

const meta = {
  title: "Examples/Overlays",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Popover: Story = { render: () => <PopoverStory /> }
export const Toast: Story = { render: () => <ToastStory /> }
