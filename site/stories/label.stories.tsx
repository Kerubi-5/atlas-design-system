import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../../src/input.js"
import { Label } from "../../src/label.js"

const meta = {
  title: "Components/Label",
  component: Label,
  args: { children: "Email address" },
  argTypes: { children: { control: "text" } },
  render: function Render(args) {
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label {...args} htmlFor={id} />
        <Input id={id} type="email" placeholder="you@atlas.dev" />
      </div>
    )
  },
} satisfies Meta<typeof Label>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
