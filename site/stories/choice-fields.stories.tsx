import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChoiceFieldsStory } from "../../stories/choice-fields.js"

const meta = {
  title: "Forms/Choice fields",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Form: Story = { render: () => <ChoiceFieldsStory /> }
