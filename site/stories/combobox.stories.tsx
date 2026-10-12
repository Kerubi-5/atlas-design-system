import { useId, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { fn } from "storybook/test"
import { Combobox } from "../../src/combobox.js"
import { Label } from "../../src/label.js"
import { formControlOptions } from "../../stories/form-control-triggers.js"

/** App-side ISO 4217-style check. The kit does not own currency catalogs. */
function iso4217Code(query: string) {
  const code = query.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : null
}

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
    creatable: false,
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
    creatable: { control: "boolean" },
    normalizeCreateValue: { control: false },
    createLabel: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Choose one item from a searchable list. Set `creatable` to offer creating a query that is not already an option. Domain lists and validation stay in the app. This example includes a visible label.",
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
export const Creatable: Story = {
  args: {
    value: "",
    creatable: true,
    searchPlaceholder: "Search or type a 3-letter code",
    emptyText: "Type a 3-letter code to create it",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Invent a value the catalog does not have. `normalizeCreateValue` lives in the app (here, `^[A-Z]{3}$`); choosing Create calls `onValueChange` like a normal selection.",
      },
    },
  },
  render: function Render(args) {
    const id = useId()
    const [options, setOptions] = useState(args.options)
    const [value, setValue] = useState(args.value)
    return (
      <div className="grid max-w-md gap-2">
        <Label htmlFor={id}>Currency</Label>
        <Combobox
          {...args}
          id={id}
          options={options}
          value={value}
          creatable
          normalizeCreateValue={iso4217Code}
          onValueChange={(next) => {
            args.onValueChange(next)
            setOptions((current) =>
              current.some((option) => option.value === next)
                ? current
                : [...current, { value: next, label: next }]
            )
            setValue(next)
          }}
        />
      </div>
    )
  },
}
