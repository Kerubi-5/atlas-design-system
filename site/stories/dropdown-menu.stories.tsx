import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"

import { Button } from "../../src/button.js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../src/dropdown-menu.js"
import { DropdownMenuStory } from "../../stories/menus.js"

type Args = { open: boolean; label: string; destructiveItem: boolean }

const meta = {
  title: "Components/Dropdown menu",
  args: { open: false, label: "Actions", destructiveItem: true },
  argTypes: {
    open: { control: "boolean" },
    label: { control: "text" },
    destructiveItem: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <DropdownMenu
        open={args.open}
        onOpenChange={(open) => updateArgs({ open })}
      >
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            Open menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{args.label}</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          {args.destructiveItem ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const RowActions: Story = {
  render: () => <DropdownMenuStory />,
  parameters: { controls: { disable: true } },
}
