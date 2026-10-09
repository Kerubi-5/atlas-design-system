import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  EmptyPanelStory,
  SkeletonAndSeparatorStory,
  ErrorFallbackStory,
} from "../../stories/display.js"

const meta = {
  title: "Examples/Display",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const EmptyStates: Story = { render: () => <EmptyPanelStory /> }
export const Loading: Story = { render: () => <SkeletonAndSeparatorStory /> }
export const Recovery: Story = { render: () => <ErrorFallbackStory /> }
