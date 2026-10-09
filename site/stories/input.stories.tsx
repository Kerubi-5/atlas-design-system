import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Input } from "../../src/input.js"
import { Label } from "../../src/label.js"

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    value: "Q4 export",
    placeholder: "Enter a title",
    disabled: false,
    type: "text",
    "aria-invalid": false,
  },
  argTypes: {
    value: { control: "text" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>Title</Label>
        <Input
          {...args}
          id={id}
          onChange={(event) => updateArgs({ value: event.target.value })}
        />
      </div>
    )
  },
} satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Invalid: Story = { args: { "aria-invalid": true } }
export const Disabled: Story = { args: { disabled: true } }
