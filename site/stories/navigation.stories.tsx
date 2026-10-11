import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  TabsNavDesktopStory,
  TabsNavNarrowStory,
  TabsNavStory,
  TabsOverflowStory,
  TabsStory,
} from "../../stories/navigation.js"

const meta = {
  title: "Examples/Navigation",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Tabs: Story = { render: () => <TabsStory /> }
export const TabsOverflow: Story = { render: () => <TabsOverflowStory /> }
export const Links: Story = { render: () => <TabsNavStory /> }
export const LinksNarrow: Story = { render: () => <TabsNavNarrowStory /> }
export const LinksDesktop: Story = { render: () => <TabsNavDesktopStory /> }
