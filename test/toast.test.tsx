import * as React from "react"
import { act } from "react"
import { describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "../src/theme-provider.js"
import { Toaster, toast } from "../src/toast.js"

import {
  createUser,
  dismissToastsAfterEach,
  render,
  screen,
  waitFor,
  within,
} from "./helpers.js"

/** The toast showing `text`, once it appears. */
async function findToast(text: string) {
  return (await screen.findByText(text)).closest<HTMLElement>(
    "[data-sonner-toast]"
  )!
}

describe("Toaster", () => {
  function renderToaster(props: React.ComponentProps<typeof Toaster> = {}) {
    return render(
      <ThemeProvider forcedTheme="light" enableShortcut={false}>
        <Toaster {...props} />
      </ThemeProvider>
    )
  }

  dismissToastsAfterEach()

  it("shows a toast() message and returns its id", async () => {
    renderToaster()
    let id: string | number = ""
    act(() => {
      id = toast("Settings saved")
    })
    expect(await screen.findByText("Settings saved")).toBeInTheDocument()
    expect(["string", "number"]).toContain(typeof id)
  })

  it("styles status toasts with kit tones, icons, and buttons", async () => {
    const user = createUser()
    const onRetry = vi.fn()
    renderToaster()
    act(() => {
      toast.error("Could not save", {
        description: "The server did not respond.",
        action: { label: "Retry", onClick: onRetry },
      })
    })
    const item = await findToast("Could not save")
    expect(item).toHaveAttribute("data-type", "error")
    expect(item).toHaveAttribute("data-styled", "false")
    expect(item.className).toContain("bg-popover")
    expect(item.className).toContain("border-destructive/40")
    // The icon takes the toast's tone (`statusTone`, shared with Alert).
    expect(item.className).toContain("[--status-tone:var(--color-destructive)]")
    expect(item.querySelector("[data-icon] svg")).toHaveClass(
      "text-(--status-tone)"
    )
    expect(screen.getByText("The server did not respond.")).toBeVisible()
    const retry = screen.getByRole("button", { name: "Retry" })
    expect(retry.className).toContain("bg-primary")
    expect(retry.className).toContain("focus-visible:ring-ring")
    await user.click(retry)
    expect(onRetry).toHaveBeenCalled()
  })

  it("draws a compact plain toast with a floating circular close badge and no icon", async () => {
    renderToaster()
    act(() => {
      toast("Saved")
    })
    const item = await findToast("Saved")
    expect(item.querySelector("[data-icon]")).toBeNull()
    expect(item.className).toContain("w-max")
    expect(item.className).toContain("max-w-[min(356px,calc(100vw-2rem))]")
    expect(item.className).toContain("rounded-none")
    expect(item.className).toContain("pl-4")
    expect(item.className).toContain("pr-6")
    expect(item.className).toContain("gap-x-2.5")
    expect(item.className).toContain("overflow-visible")
    expect(item.className).not.toContain("pr-11")
    expect(item.className).not.toContain("px-4")
    const close = within(item).getByRole("button", { name: "Close toast" })
    // Popover-fill ! utilities beat Sonner's unlayered [data-button] /
    // [data-close-button] foreground square; the badge sits on the corner.
    expect(close.className).toContain("!bg-popover")
    expect(close.className).toContain("!rounded-full")
    expect(close.className).toContain("!-top-2")
    expect(close.className).toContain("!text-muted-foreground")
    expect(close.className).not.toContain("bg-primary")
  })

  it("adds a labelled close button unless closeButton is false", async () => {
    const user = createUser()
    const { unmount } = renderToaster()
    act(() => {
      toast.success("Order archived")
    })
    const item = await findToast("Order archived")
    await user.click(within(item).getByRole("button", { name: "Close toast" }))
    await waitFor(() => {
      expect(screen.queryByText("Order archived")).toBeNull()
    })
    unmount()

    renderToaster({ closeButton: false })
    act(() => {
      toast.info("Sync finished")
    })
    await screen.findByText("Sync finished")
    expect(screen.queryByRole("button", { name: "Close toast" })).toBeNull()
  })

  it("updates a toast in place when its id is reused, and dismisses by id", async () => {
    renderToaster()
    let id: string | number = ""
    act(() => {
      id = toast.loading("Saving")
    })
    await screen.findByText("Saving")
    act(() => {
      toast.success("Saved", { id })
    })
    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(screen.queryByText("Saving")).toBeNull()
    expect(document.querySelectorAll("[data-sonner-toast]")).toHaveLength(1)
    act(() => {
      toast.dismiss(id)
    })
    await waitFor(() => {
      expect(screen.queryByText("Saved")).toBeNull()
    })
  })

  it("passes only kit options through, so callers cannot restyle toasts", async () => {
    // Plain JavaScript callers can still hand over options of the library
    // underneath; the kit drops them instead of forwarding them.
    renderToaster({
      richColors: true,
      toastOptions: { classNames: { toast: "app-toaster" } },
    } as React.ComponentProps<typeof Toaster>)
    act(() => {
      toast.warning("Storage almost full", {
        className: "app-toast",
        unstyled: false,
      } as Parameters<typeof toast.warning>[1])
    })
    const item = await findToast("Storage almost full")
    expect(item).toHaveAttribute("data-styled", "false")
    expect(item.getAttribute("data-rich-colors")).not.toBe("true")
    expect(item.className).not.toContain("app-toast")
    expect(item.className).toContain("border-warning/40")
  })
})

describe("toast action and cancel buttons", () => {
  dismissToastsAfterEach()

  it("calls the kit callbacks when action and cancel are clicked", async () => {
    const user = createUser()
    const onAction = vi.fn()
    const onCancel = vi.fn()
    render(<Toaster />)
    act(() => {
      toast("Archived", {
        action: { label: "Undo", onClick: onAction },
        cancel: { label: "Keep", onClick: onCancel },
      })
    })
    const item = await findToast("Archived")
    await user.click(within(item).getByRole("button", { name: "Undo" }))
    expect(onAction).toHaveBeenCalledTimes(1)

    act(() => {
      toast("Archived again", {
        cancel: { label: "Keep", onClick: onCancel },
      })
    })
    const second = await findToast("Archived again")
    await user.click(within(second).getByRole("button", { name: "Keep" }))
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1))
  })
})

describe("stacked toasts", () => {
  dismissToastsAfterEach()

  it("expands the stack while keyboard focus is inside it", async () => {
    const user = createUser()
    render(
      <>
        <button type="button">Before</button>
        <Toaster />
      </>
    )
    act(() => {
      toast("First")
      toast("Second")
    })
    await screen.findByText("Second")
    const toasts = () =>
      Array.from(document.querySelectorAll("[data-sonner-toast]"))
    await waitFor(() => expect(toasts()).toHaveLength(2))
    for (const item of toasts()) {
      expect(item).toHaveAttribute("data-expanded", "false")
    }

    screen.getByRole("button", { name: "Before" }).focus()
    await user.tab()
    for (const item of toasts()) {
      expect(item).toHaveAttribute("data-expanded", "true")
    }

    act(() => {
      screen.getByRole("button", { name: "Before" }).focus()
    })
    await waitFor(() => {
      for (const item of toasts()) {
        expect(item).toHaveAttribute("data-expanded", "false")
      }
    })
  })
})
