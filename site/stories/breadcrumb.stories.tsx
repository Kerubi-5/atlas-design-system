import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../src/breadcrumb.js"
import { BreadcrumbStory } from "../../stories/wayfinding.js"

type Args = { section: string; page: string }

const meta = {
  title: "Navigation/Breadcrumb",
  args: { section: "Orders", page: "Order 1042" },
  argTypes: {
    section: { control: "text" },
    page: { control: "text" },
  },
  render: (args) => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#section">{args.section}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{args.page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Collapsed: Story = {
  render: () => <BreadcrumbStory />,
  parameters: { controls: { disable: true } },
}
