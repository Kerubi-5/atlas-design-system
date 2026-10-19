import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  LabelInputTextareaStory,
  FieldStory,
  FocusFirstInvalidStory,
  FormHelpersStory,
  CustomControlFieldStory,
} from "../../stories/fields.js"
import { FormControlTriggersStory } from "../../stories/form-control-triggers.js"

const meta = {
  title: "Examples/Fields",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: "Compose labels, hints, inputs, and form feedback.",
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const LabelsAndInputs: Story = {
  render: () => <LabelInputTextareaStory />,
}
export const FieldComposition: Story = { render: () => <FieldStory /> }
export const FormHelpers: Story = { render: () => <FormHelpersStory /> }
export const TriggerAlignment: Story = {
  render: () => <FormControlTriggersStory />,
}
export const CustomControlField: Story = {
  render: () => <CustomControlFieldStory />,
}
export const FocusFirstInvalid: Story = {
  render: () => <FocusFirstInvalidStory />,
  parameters: {
    docs: {
      description: {
        story:
          "Press Save with the fields empty: `focusFirstInvalid` moves focus to the first field with an error, and the errors show. Fields carry `id={field.name}` so the handler finds them.",
      },
    },
  },
}
