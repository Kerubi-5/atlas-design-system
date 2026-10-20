import type * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"

import { Button } from "../../src/button.js"
import {
  ButtonVariantsStory,
  OutlineOnSelectedStory,
  QuietButtonHoverStory,
} from "../../stories/button-hover.js"
import { controlOptions } from "../src/lib/controls.js"

type Props = React.ComponentProps<typeof Button>

const meta = {
  title: "Actions/Button",
  component: Button,
  args: {
    children: "Save",
    variant: "default",
    size: "default",
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: controlOptions<NonNullable<Props["variant"]>>({
        default: true,
        outline: true,
        secondary: true,
        ghost: true,
        destructive: true,
        link: true,
      }),
    },
    size: {
      control: "select",
      options: controlOptions<NonNullable<Props["size"]>>({
        default: true,
        xs: true,
        sm: true,
        lg: true,
        icon: true,
        "icon-xs": true,
        "icon-sm": true,
        "icon-lg": true,
      }),
    },
    disabled: { control: "boolean" },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Variants: Story = {
  render: () => <ButtonVariantsStory />,
  parameters: { controls: { disable: true } },
}
export const OnSelected: Story = {
  render: () => <OutlineOnSelectedStory />,
  parameters: { controls: { disable: true } },
}
export const HoverReference: Story = {
  render: () => <QuietButtonHoverStory />,
  parameters: { controls: { disable: true } },
}
