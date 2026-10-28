import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  FieldStory,
  FormHelpersStory,
  PairedFieldsStory,
  SelectableFieldStory,
} from "../../stories/fields.js"

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
export const Selectable: Story = { render: () => <SelectableFieldStory /> }
export const FormHelpers: Story = { render: () => <FormHelpersStory /> }
export const PairedFields: Story = {
  render: () => <PairedFieldsStory />,
  parameters: {
    docs: {
      description: {
        story:
          "Two fields in a row, only one with a hint. `items-start` keeps the inputs on one top edge because the hint sits under the control.",
      },
    },
  },
}
