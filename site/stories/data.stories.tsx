import type { Meta, StoryObj } from "@storybook/react-vite"
import { Table } from "../../src/table.js"
import { TableStory, TableBodySkeletonStory } from "../../stories/data.js"
import {
  NarrowPanelTableStory,
  ProfileCardTableStory,
} from "../../stories/table-overflow.js"

const meta = {
  title: "Examples/Tables",
  component: Table,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Table>
export default meta
type Story = StoryObj<typeof meta>
export const Sortable: Story = { render: () => <TableStory /> }
export const Loading: Story = { render: () => <TableBodySkeletonStory /> }
export const NarrowPanel: Story = { render: () => <NarrowPanelTableStory /> }
export const ProfileCard: Story = { render: () => <ProfileCardTableStory /> }
