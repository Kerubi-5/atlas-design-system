import type { Meta, StoryObj } from "@storybook/react-vite"

import { FieldStory, FormHelpersStory } from "../../stories/fields.js"

const meta = {
  title: "Forms/Field",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Field primitives and the portable form helpers. Form controls stay aligned with Input.",
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Composition: Story = { render: () => <FieldStory /> }
export const FormHelpers: Story = { render: () => <FormHelpersStory /> }
