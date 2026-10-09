import type { Meta, StoryObj } from "@storybook/react-vite"
import { TabsStory, TabsNavStory } from "../../stories/navigation.js"

const meta = {
  title: "Examples/Navigation",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Tabs: Story = { render: () => <TabsStory /> }
export const Links: Story = { render: () => <TabsNavStory /> }
