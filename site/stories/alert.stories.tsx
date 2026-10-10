import type { Meta, StoryObj } from "@storybook/react-vite"
import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "../../src/alert.js"
import { AlertStory } from "../../stories/feedback.js"

type Args = {
  variant: "default" | "success" | "warning" | "destructive"
  title: string
  description: string
  icon: boolean
}

const meta = {
  title: "Components/Alert",
  args: {
    variant: "destructive",
    title: "Could not save",
    description: "The server did not respond. Try again.",
    icon: true,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "destructive"],
    },
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: "boolean" },
  },
  render: (args) => (
    <Alert variant={args.variant} className="max-w-xl">
      {args.icon ? <CircleAlertIcon /> : null}
      <AlertTitle>{args.title}</AlertTitle>
      <AlertDescription>{args.description}</AlertDescription>
    </Alert>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Tones: Story = {
  render: () => <AlertStory />,
  parameters: { controls: { disable: true } },
}
