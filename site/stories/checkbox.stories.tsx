import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Checkbox } from "../../src/checkbox.js"
import { Label } from "../../src/label.js"
import { CheckboxStory } from "../../stories/selection.js"

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  args: { checked: true, disabled: false, "aria-invalid": false },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const id = useId()
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          {...args}
          id={id}
          onCheckedChange={(checked) =>
            updateArgs({ checked: checked === true })
          }
        />
        <Label htmlFor={id}>Email me when the export is ready</Label>
      </div>
    )
  },
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <CheckboxStory />,
  parameters: { controls: { disable: true } },
}
