import type { Meta, StoryObj } from "@storybook/react-vite"

import { KanbanRailStory } from "../../stories/kanban-rail.js"

const meta = {
  title: "Data display/Kanban",
  parameters: { controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Rail: Story = { render: () => <KanbanRailStory /> }
