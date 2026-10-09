import { toast } from "sonner"

import { Button } from "../src/button.js"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../src/dialog.js"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../src/popover.js"

/** Dialog with header, body, and square chrome. */
export function DialogStory() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Open dialog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive export</DialogTitle>
          <DialogDescription>
            This removes the file from the live list. You can restore it later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">Archive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Popover with title and description. */
export function PopoverStory() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Shortcuts</PopoverTitle>
          <PopoverDescription>
            Press D to toggle light and dark.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

/** Sonner toast using the kit toaster tokens. */
export function ToastStory() {
  return (
    <Button type="button" variant="outline" onClick={() => toast("Saved")}>
      Show toast
    </Button>
  )
}
