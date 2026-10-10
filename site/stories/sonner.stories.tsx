import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../../src/button.js"
import { toast } from "../../src/sonner.js"
import { ToastStory, ToastTypesStory } from "../../stories/overlays.js"

type Args = { message: string }
const meta = {
  title: "Feedback/Sonner",
  args: { message: "Saved" },
  argTypes: { message: { control: "text" } },
  render: (args) => (
    <Button type="button" variant="outline" onClick={() => toast(args.message)}>
      Show toast
    </Button>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <ToastStory />,
  parameters: { controls: { disable: true } },
}
/** Default, success, info, warning, and error toasts, kept open. */
export const Types: Story = {
  render: () => <ToastTypesStory />,
  // The story mounts its own expanded Toaster instead of the global one.
  parameters: { controls: { disable: true }, toaster: false },
}
