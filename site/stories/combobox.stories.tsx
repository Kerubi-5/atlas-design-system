import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { Combobox } from "../../src/combobox.js"
import { Label } from "../../src/label.js"
import { formControlOptions } from "../../stories/form-control-triggers.js"

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  args: {
    options: formControlOptions,
    value: "usd",
    placeholder: "Choose a currency",
    searchPlaceholder: "Search currencies",
    emptyText: "No currencies found",
    disabled: false,
    onValueChange: fn(),
  },
  argTypes: {
    value: {
      control: "select",
      options: ["", ...formControlOptions.map((option) => option.value)],
    },
    options: { control: "object" },
    placeholder: { control: "text" },
    searchPlaceholder: { control: "text" },
    emptyText: { control: "text" },
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Choose one item from a searchable list. This example includes a visible label.",
      },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>Currency</Label>
        <Combobox
          {...args}
          id={id}
          onValueChange={(value) => {
            args.onValueChange(value)
            updateArgs({ value })
          }}
        />
      </div>
    )
  },
} satisfies Meta<typeof Combobox>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Empty: Story = { args: { value: "" } }
export const Disabled: Story = { args: { disabled: true } }
