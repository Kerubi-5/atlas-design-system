import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../src/pagination.js"
import { PaginationStory } from "../../stories/wayfinding.js"

type Args = { page: number; pageCount: number }

const meta = {
  title: "Components/Pagination",
  args: { page: 2, pageCount: 5 },
  argTypes: {
    page: { control: { type: "number", min: 1, max: 10 } },
    pageCount: { control: { type: "number", min: 1, max: 10 } },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    const go = (page: number) => (event: React.MouseEvent) => {
      event.preventDefault()
      updateArgs({ page: Math.min(Math.max(page, 1), args.pageCount) })
    }
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={go(args.page - 1)} />
          </PaginationItem>
          {Array.from({ length: args.pageCount }, (_, index) => index + 1).map(
            (page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === args.page}
                  onClick={go(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext href="#" onClick={go(args.page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const WithEllipsis: Story = {
  render: () => <PaginationStory />,
  parameters: { controls: { disable: true } },
}
