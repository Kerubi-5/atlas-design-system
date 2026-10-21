import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Toggle } from "../../src/toggle.js"
import { ToggleStory } from "../../stories/selection.js"
import { controlOptions } from "../src/lib/controls.js"

type Props = React.ComponentProps<typeof Toggle>

const meta = {
  title: "Actions/Toggle",
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
    variant: {
      control: "select",
      options: controlOptions<NonNullable<Props["variant"]>>({
        default: true,
        outline: true,
      }),
    },
    size: {
      control: "select",
      options: controlOptions<NonNullable<Props["size"]>>({
        default: true,
        sm: true,
        lg: true,
      }),
    },
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
