import type { Meta, StoryObj } from "@storybook/react-vite"
import { useArgs } from "storybook/preview-api"
import { Button } from "../../src/button.js"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/dialog.js"
import { DialogStory } from "../../stories/overlays.js"

type Args = {
  open: boolean
  title: string
  description: string
  triggerLabel: string
  confirmLabel: string
}
const meta = {
  title: "Overlays/Dialog",
  args: {
    open: false,
    title: "Archive export",
    description:
      "This removes the file from the live list. You can restore it later.",
    triggerLabel: "Open dialog",
    confirmLabel: "Archive",
  },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    triggerLabel: { control: "text" },
    confirmLabel: { control: "text" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Dialog open={args.open} onOpenChange={(open) => updateArgs({ open })}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            {args.triggerLabel}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{args.title}</DialogTitle>
            <DialogDescription>{args.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button">{args.confirmLabel}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <DialogStory />,
  parameters: { controls: { disable: true } },
}
