import type { Meta, StoryObj } from "@storybook/react-vite"
import { Card } from "../../src/card.js"
import {
  FlexColumnCardsStory,
  CardContentPx0Story,
} from "../../stories/card-layout.js"

const meta = {
  title: "Examples/Cards",
  component: Card,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>
export const FlexColumn: Story = { render: () => <FlexColumnCardsStory /> }
export const FullBleed: Story = { render: () => <CardContentPx0Story /> }
