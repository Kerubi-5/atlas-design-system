import * as React from "react"

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
import { Toaster, toast } from "../src/sonner.js"

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

/**
 * Every toast type at once, kept open, with its own expanded toaster. Mount
 * it where no other Toaster is rendered.
 */
export function ToastTypesStory() {
  React.useEffect(() => {
    const keep = { duration: Number.POSITIVE_INFINITY }
    toast("Export scheduled", { ...keep, id: "default" })
    toast.success("Settings saved", { ...keep, id: "success" })
    toast.info("Exports run nightly", {
      ...keep,
      id: "info",
      description: "Files land in the shared drive by 6am.",
    })
    toast.warning("Trial ends in 3 days", { ...keep, id: "warning" })
    toast.error("Could not save", {
      ...keep,
      id: "error",
      description: "The server did not respond.",
      action: { label: "Retry", onClick: () => {} },
      cancel: { label: "Dismiss", onClick: () => {} },
    })
    return () => {
      toast.dismiss()
    }
  }, [])
  return <Toaster expand visibleToasts={5} position="top-left" />
}
