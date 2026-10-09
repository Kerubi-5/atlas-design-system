import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { Label } from "../../src/label.js"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/select.js"
import { formControlOptions } from "../../stories/form-control-triggers.js"

type Args = { value: string; placeholder: string; disabled: boolean }
const meta = {
  title: "Components/Select",
  args: { value: "usd", placeholder: "Choose a currency", disabled: false },
  argTypes: {
    value: {
      control: "select",
      options: ["", ...formControlOptions.map((option) => option.value)],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>Currency</Label>
        <Select
          value={args.value}
          disabled={args.disabled}
          onValueChange={(value) => updateArgs({ value })}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={args.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {formControlOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Empty: Story = { args: { value: "" } }
export const Disabled: Story = { args: { disabled: true } }
