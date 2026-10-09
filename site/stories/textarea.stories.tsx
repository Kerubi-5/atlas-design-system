import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { Textarea } from "../../src/textarea.js"
import { Label } from "../../src/label.js"

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    value: "Include last month.",
    placeholder: "Add notes",
    rows: 3,
    disabled: false,
  },
  argTypes: {
    value: { control: "text" },
    placeholder: { control: "text" },
    rows: { control: { type: "number", min: 1, max: 10 } },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>Notes</Label>
        <Textarea
          {...args}
          id={id}
          onChange={(event) => updateArgs({ value: event.target.value })}
        />
      </div>
    )
  },
} satisfies Meta<typeof Textarea>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Disabled: Story = { args: { disabled: true } }
