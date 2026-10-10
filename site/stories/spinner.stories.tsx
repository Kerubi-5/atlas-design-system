import type { Meta, StoryObj } from "@storybook/react-vite"

import { Spinner } from "../../src/spinner.js"
import { SpinnerStory } from "../../stories/feedback.js"

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  args: { "aria-label": "Loading", className: "size-4" },
  argTypes: {
    "aria-label": { control: "text" },
    className: { control: "select", options: ["size-4", "size-6", "size-8"] },
  },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const InButton: Story = {
  render: () => <SpinnerStory />,
  parameters: { controls: { disable: true } },
}
