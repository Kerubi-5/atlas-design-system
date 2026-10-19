import { act, renderHook } from "@testing-library/react"
import { hydrateRoot, type Root } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FormSelectField } from "../src/form/select-field.js"
import { SelectItem } from "../src/select.js"
import { Toaster, toast } from "../src/toast.js"
import { useMediaQuery } from "../src/internal/use-media-query.js"

import {
  createUser,
  dismissToastsAfterEach,
  fakeTextField,
  render,
  screen,
  stubMatchMedia,
  waitFor,
  within,
} from "./helpers.js"

/**
 * Branch coverage for the 0.8.0 polish pass: the paths an app hits that the
 * happy-path tests skipped (no meta, empty preview, hidden errors, toast
 * buttons, media-query fallbacks).
 */

function markdownField(value: string, errors: string[] = []) {
  return fakeTextField("notes", value, errors)
}

describe("FormSelectField", () => {
  it("stays valid without meta or when meta has no errors", () => {
    const { rerender } = render(
      <FormSelectField
        value={undefined}
        label="Plan"
        placeholder="Pick a plan"
        onValueChange={() => {}}
      >
        <SelectItem value="free">Free</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Plan" })
    expect(trigger).not.toHaveAttribute("aria-invalid")
    expect(trigger).not.toHaveAttribute("aria-describedby")
    expect(trigger).toHaveTextContent("Pick a plan")
    expect(screen.queryByRole("alert")).toBeNull()

    rerender(
      <FormSelectField
        value="free"
        meta={{ errors: [] }}
        label="Plan"
        onValueChange={() => {}}
      >
        <SelectItem value="free">Free</SelectItem>
      </FormSelectField>
    )
    expect(screen.getByRole("combobox", { name: "Plan" })).not.toHaveAttribute(
      "aria-invalid"
    )
  })

  it("marks the trigger invalid and shows the first error", () => {
    render(
      <FormSelectField
        value=""
        meta={{ errors: ["Choose a plan"] }}
        label="Plan"
        onValueChange={() => {}}
      >
        <SelectItem value="free">Free</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Plan" })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    // WCAG 1.3.1 / 3.3.1: the error is the trigger's description.
    expect(trigger).toHaveAccessibleDescription("Choose a plan")
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a plan")
  })
})

describe("FormMarkdownField", () => {
  it("forwards typing and blur to the field api", async () => {
    const user = createUser()
    const field = markdownField("")
    render(<FormMarkdownField field={field} label="Notes" />)
    const box = screen.getByLabelText("Notes")
    expect(box).toHaveAttribute("placeholder", "Markdown supported")
    expect(box).toHaveAttribute("rows", "5")
    await user.type(box, "a")
    await user.tab()
    expect(field.handleChange).toHaveBeenCalledWith("a")
    expect(field.handleBlur).toHaveBeenCalled()
  })

  it("shows an empty-preview message for blank content", async () => {
    const user = createUser()
    render(<FormMarkdownField field={markdownField("   ")} label="Notes" />)
    await user.click(screen.getByRole("radio", { name: "Preview" }))
    expect(screen.getByText("Nothing to preview")).toBeInTheDocument()
  })

  it("stays in its mode when the active toggle is pressed again", async () => {
    const user = createUser()
    render(<FormMarkdownField field={markdownField("Hi")} label="Notes" />)
    await user.click(screen.getByRole("radio", { name: "Write" }))
    expect(screen.getByLabelText("Notes")).toBeInTheDocument()
  })

  it("hides errors and invalid state when showError is false", () => {
    render(
      <FormMarkdownField
        field={markdownField("", ["Required"])}
        id="custom-notes"
        label="Notes"
        placeholder="Write here"
        rows={3}
        showError={false}
      />
    )
    const box = screen.getByLabelText("Notes")
    expect(box).toHaveAttribute("id", "custom-notes")
    expect(box).toHaveAttribute("rows", "3")
    expect(box).not.toHaveAttribute("aria-invalid")
    expect(screen.queryByRole("alert")).toBeNull()
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
    const item = (await screen.findByText("Archived")).closest(
      "[data-sonner-toast]"
    ) as HTMLElement
    await user.click(within(item).getByRole("button", { name: "Undo" }))
    expect(onAction).toHaveBeenCalledTimes(1)

    act(() => {
      toast("Archived again", {
        cancel: { label: "Keep", onClick: onCancel },
      })
    })
    const second = (await screen.findByText("Archived again")).closest(
      "[data-sonner-toast]"
    ) as HTMLElement
    await user.click(within(second).getByRole("button", { name: "Keep" }))
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1))
  })
})

describe("useMediaQuery", () => {
  const original = window.matchMedia

  afterEach(() => {
    window.matchMedia = original
  })

  it("falls back to defaultMatches without matchMedia", () => {
    // @ts-expect-error simulate an environment without matchMedia
    delete window.matchMedia
    const { result } = renderHook(() => useMediaQuery("(min-width: 1px)", true))
    expect(result.current).toBe(true)
  })

  it("follows change events and unsubscribes on unmount", () => {
    let matches = false
    const listeners = new Set<() => void>()
    const remove = vi.fn((_: string, l: () => void) => listeners.delete(l))
    window.matchMedia = ((query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (_: string, l: () => void) => listeners.add(l),
      removeEventListener: remove,
    })) as unknown as typeof window.matchMedia

    const { result, unmount } = renderHook(() => useMediaQuery("(x)"))
    expect(result.current).toBe(false)
    act(() => {
      matches = true
      listeners.forEach((l) => l())
    })
    expect(result.current).toBe(true)
    unmount()
    expect(remove).toHaveBeenCalled()
  })

  // The server renders `defaultMatches`. Reading matchMedia in the first
  // client render made hydration disagree with that markup on a wide screen.
  it("hydrates with defaultMatches, then follows the real query", async () => {
    const restore = stubMatchMedia(true)
    function Probe() {
      return <span>{String(useMediaQuery("(min-width: 768px)"))}</span>
    }
    const container = document.createElement("div")
    container.innerHTML = renderToString(<Probe />).replace("true", "false")
    document.body.append(container)
    const onRecoverableError = vi.fn()
    let root: Root | undefined
    await act(async () => {
      root = hydrateRoot(container, <Probe />, { onRecoverableError })
    })
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(container.textContent).toBe("true")
    act(() => root?.unmount())
    container.remove()
    restore()
  })
})
