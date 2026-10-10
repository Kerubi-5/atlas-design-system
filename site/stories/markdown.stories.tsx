import type { Meta, StoryObj } from "@storybook/react-vite"

import { Markdown } from "../../src/markdown.js"
import {
  FormMarkdownFieldStory,
  MarkdownStory,
} from "../../stories/markdown.js"

const meta = {
  title: "Components/Markdown",
  component: Markdown,
  args: {
    content:
      "## Notes\n\nUse **bold** text and a [safe link](https://example.com).",
  },
  argTypes: {
    content: { control: "text" },
  },
  render: (args) => <Markdown className="max-w-lg" {...args} />,
} satisfies Meta<typeof Markdown>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Gfm: Story = {
  render: () => <MarkdownStory />,
  parameters: { controls: { disable: true } },
}
export const FormField: Story = {
  render: () => <FormMarkdownFieldStory />,
  parameters: { controls: { disable: true } },
}
