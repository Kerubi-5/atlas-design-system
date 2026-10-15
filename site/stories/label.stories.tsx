import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../../src/input.js"
import { Label } from "../../src/label.js"

const meta = {
  title: "Forms/Label",
  component: Label,
  args: { children: "Email address", required: false },
  argTypes: {
    children: { control: "text" },
    required: {
      control: "boolean",
      description:
        "Visible marker only; also set `required` on the control so screen readers announce it",
    },
  },
  render: function Render(args) {
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label {...args} htmlFor={id} />
        <Input
          id={id}
          type="email"
          placeholder="you@atlas.dev"
          required={args.required}
        />
      </div>
    )
  },
} satisfies Meta<typeof Label>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Required: Story = { args: { required: true } }
