import type { Meta, StoryObj } from "@storybook/react-vite"
import { toast } from "sonner"

import { Button } from "../../src/button.js"
import { ToastStory } from "../../stories/overlays.js"

type Args = { message: string }
const meta = {
  title: "Components/Sonner",
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
