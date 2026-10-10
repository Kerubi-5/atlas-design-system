import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Toggle } from "../../src/toggle.js"
import { ToggleStory } from "../../stories/selection.js"

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  args: {
    children: "Bold",
    pressed: false,
    variant: "default",
    size: "default",
    disabled: false,
  },
  argTypes: {
    children: { control: "text" },
    pressed: { control: "boolean" },
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Toggle
        {...args}
        onPressedChange={(pressed) => updateArgs({ pressed })}
      />
    )
  },
} satisfies Meta<typeof Toggle>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Variants: Story = {
  render: () => <ToggleStory />,
  parameters: { controls: { disable: true } },
}
