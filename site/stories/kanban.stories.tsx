import type { Meta, StoryObj } from "@storybook/react-vite"

import { KanbanSkeletonStory, KanbanStory } from "../../stories/kanban.js"

const meta = {
  title: "Data display/Kanban",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Board: Story = { render: () => <KanbanStory /> }
export const Loading: Story = { render: () => <KanbanSkeletonStory /> }
