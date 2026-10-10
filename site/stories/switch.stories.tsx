import { useId } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Label } from "../../src/label.js"
import { Switch } from "../../src/switch.js"
import { SwitchStory } from "../../stories/choices.js"

const meta = {
  title: "Forms/Switch",
  component: Switch,
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
        <Switch
          {...args}
          id={id}
          onCheckedChange={(checked) => updateArgs({ checked })}
        />
        <Label htmlFor={id}>Send a weekly digest</Label>
      </div>
    )
  },
} satisfies Meta<typeof Switch>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Settings: Story = {
  render: () => <SwitchStory />,
  parameters: { controls: { disable: true } },
}
