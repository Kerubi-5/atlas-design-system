import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"

import { Button } from "../../src/button.js"
import {
  ButtonVariantsStory,
  OutlineOnSelectedStory,
  QuietButtonHoverStory,
} from "../../stories/button-hover.js"

const meta = {
  title: "Components/Button",
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
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
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
