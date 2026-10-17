import type { Meta, StoryObj } from "@storybook/react-vite"

import { PageLayoutStory } from "../../stories/page-layout.js"

const meta = {
  title: "Layout/Page header",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const WithStepper: Story = { render: () => <PageLayoutStory /> }
