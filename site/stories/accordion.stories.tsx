import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../src/accordion.js"
import { AccordionStory } from "../../stories/content.js"

type Args = { value: string }
const items = [
  ["exports", "When do exports run?", "Every night at 2am."],
  ["formats", "Which formats are supported?", "CSV and XLSX."],
] as const

const meta = {
  title: "Layout/Accordion",
  args: { value: "exports" },
  argTypes: {
    value: { control: "select", options: ["", "exports", "formats"] },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Accordion
        type="single"
        collapsible
        value={args.value}
        onValueChange={(value) => updateArgs({ value })}
        className="max-w-xl"
      >
        {items.map(([value, question, answer]) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Faq: Story = {
  render: () => <AccordionStory />,
  parameters: { controls: { disable: true } },
}
