import type { Meta, StoryObj } from "@storybook/react-vite"

import { Progress } from "../../src/progress.js"
import { ProgressStory } from "../../stories/feedback.js"

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: { value: 40, "aria-label": "Upload progress" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Progress {...args} />
    </div>
  ),
} satisfies Meta<typeof Progress>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Labelled: Story = {
  render: () => <ProgressStory />,
  parameters: { controls: { disable: true } },
}
