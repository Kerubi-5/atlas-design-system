import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../../src/button.js"
import { Toaster, toast } from "../../src/toast.js"
import { ToastStory, ToastTypesStory } from "../../stories/overlays.js"

const keep = { duration: Number.POSITIVE_INFINITY }

/**
 * Mounts one kit toaster and shows the given toasts for the story lifetime.
 * Stories that use this skip the preview decorator toaster.
 */
function MountedToasts({ run }: { run: () => void }) {
  React.useEffect(() => {
    run()
    return () => {
      toast.dismiss()
    }
    // Story canvas only: the run closure is created once per mount.
  }, [])
  return <Toaster expand visibleToasts={3} position="bottom-right" />
}

type Args = { message: string }
const meta = {
  title: "Feedback/Toast",
  args: { message: "Saved" },
  argTypes: { message: { control: "text" } },
  render: (args) => (
    <Button type="button" variant="outline" onClick={() => toast(args.message)}>
      Show toast
    </Button>
  ),
} satisfies Meta<Args>
export default meta
type Story = StoryObj<typeof meta>

const preview: Pick<Story, "tags" | "parameters"> = {
  tags: ["!autodocs"],
  parameters: { controls: { disable: true }, toaster: false },
}
export const Playground: Story = {}
export const Composition: Story = {
  render: () => <ToastStory />,
  parameters: { controls: { disable: true } },
}
/** Default, success, info, warning, and error toasts, kept open. */
export const Types: Story = {
  render: () => <ToastTypesStory />,
  // The story mounts its own expanded Toaster instead of the global one.
  parameters: { controls: { disable: true }, toaster: false },
}

export const Plain: Story = {
  ...preview,
  render: () => (
    <MountedToasts run={() => toast("Saved", { ...keep, id: "plain" })} />
  ),
}

export const Success: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() => toast.success("Settings saved", { ...keep, id: "success" })}
    />
  ),
}

export const Info: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() => toast.info("Exports run nightly", { ...keep, id: "info" })}
    />
  ),
}

export const Warning: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() =>
        toast.warning("Trial ends in 3 days", { ...keep, id: "warning" })
      }
    />
  ),
}

export const Error: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() => toast.error("Could not save", { ...keep, id: "error" })}
    />
  ),
}

export const Loading: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() => toast.loading("Saving", { ...keep, id: "loading" })}
    />
  ),
}

export const WithDescription: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() =>
        toast.info("Exports run nightly", {
          ...keep,
          id: "description",
          description: "Files land in the shared drive by 6am.",
        })
      }
    />
  ),
}

export const WithActionAndCancel: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() =>
        toast.error("Could not save", {
          ...keep,
          id: "actions",
          description: "The server did not respond.",
          action: { label: "Retry", onClick: () => {} },
          cancel: { label: "Dismiss", onClick: () => {} },
        })
      }
    />
  ),
}

export const LongText: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() =>
        toast(
          "Could not reach the shared drive. Check the network and try the export again.",
          { ...keep, id: "long" }
        )
      }
    />
  ),
}

export const Stacked: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() => {
        toast("Export scheduled", { ...keep, id: "stack-1" })
        toast.success("Settings saved", { ...keep, id: "stack-2" })
        toast.error("Could not save", { ...keep, id: "stack-3" })
      }}
    />
  ),
}

export const Queued: Story = {
  ...preview,
  render: () => (
    <MountedToasts
      run={() => {
        for (let index = 1; index <= 4; index++) {
          toast(`Export ${index} scheduled`, { ...keep, id: `queue-${index}` })
        }
      }}
    />
  ),
}
