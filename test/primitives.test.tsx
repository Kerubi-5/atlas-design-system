import * as React from "react"
import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Checkbox } from "../src/checkbox.js"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../src/field.js"
import { FormFeedbackField } from "../src/form/feedback-field.js"
import { FormSelectField } from "../src/form/select-field.js"
import { Label } from "../src/label.js"
import { SelectItem } from "../src/select.js"
import { Separator } from "../src/separator.js"
import { Skeleton } from "../src/skeleton.js"
import { Toaster, toast } from "../src/sonner.js"
import { Table } from "../src/table.js"
import { TableBodySkeleton } from "../src/table-body-skeleton.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../src/tabs.js"
import { ThemeProvider } from "../src/theme-provider.js"

import { createUser, render, screen, waitFor, within } from "./helpers.js"

describe("Checkbox", () => {
  it("toggles from its label and the keyboard", async () => {
    const user = createUser()
    const onCheckedChange = vi.fn()
    render(
      <div className="flex gap-2">
        <Checkbox id="terms" onCheckedChange={onCheckedChange} />
        <Label htmlFor="terms">Accept terms</Label>
      </div>
    )
    const box = screen.getByRole("checkbox", { name: "Accept terms" })
    expect(box).toHaveAttribute("aria-checked", "false")
    await user.click(screen.getByText("Accept terms"))
    expect(box).toHaveAttribute("aria-checked", "true")
    box.focus()
    await user.keyboard(" ")
    expect(box).toHaveAttribute("aria-checked", "false")
    expect(onCheckedChange).toHaveBeenNthCalledWith(1, true)
    expect(onCheckedChange).toHaveBeenNthCalledWith(2, false)
  })

  it("ignores clicks while disabled and passes aria-invalid through", async () => {
    const user = createUser()
    render(<Checkbox aria-label="Notify" disabled aria-invalid />)
    const box = screen.getByRole("checkbox", { name: "Notify" })
    await user.click(box)
    expect(box).toHaveAttribute("aria-checked", "false")
    expect(box).toBeDisabled()
    expect(box).toHaveAttribute("aria-invalid", "true")
  })
})

describe("Tabs", () => {
  it("moves between tabs with arrow keys and shows the matching panel", async () => {
    const user = createUser()
    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Order">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>
    )
    const overview = screen.getByRole("tab", { name: "Overview" })
    expect(overview).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel")
    overview.focus()
    await user.keyboard("{ArrowRight}")
    const activity = screen.getByRole("tab", { name: "Activity" })
    expect(activity).toHaveFocus()
    expect(activity).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel")
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      activity.id
    )
  })
})

describe("Separator", () => {
  it("is hidden from assistive tech unless it separates sections", () => {
    const { rerender } = render(<Separator data-testid="rule" />)
    expect(screen.queryByRole("separator")).toBeNull()
    expect(screen.getByTestId("rule")).toHaveAttribute("role", "none")
    rerender(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical"
    )
  })
})

describe("Skeletons", () => {
  it("renders a placeholder block that takes extra classes", () => {
    render(<Skeleton data-testid="block" className="h-4 w-24" />)
    const block = screen.getByTestId("block")
    expect(block).toHaveAttribute("data-slot", "skeleton")
    expect(block.className).toContain("h-4")
  })

  it("fills a table body with rows by columns of placeholders", () => {
    render(
      <Table>
        <TableBodySkeleton columns={3} rows={2} />
      </Table>
    )
    const rows = screen.getAllByRole("row")
    expect(rows).toHaveLength(2)
    for (const row of rows) {
      expect(within(row).getAllByRole("cell")).toHaveLength(3)
    }
    expect(document.querySelectorAll("[data-slot=skeleton]")).toHaveLength(6)
  })
})

describe("Field", () => {
  it("names a group of controls with its legend", () => {
    render(
      <FieldSet>
        <FieldLegend>Notifications</FieldLegend>
        <Field orientation="horizontal">
          <Checkbox id="email" />
          <FieldLabel htmlFor="email">Email</FieldLabel>
        </Field>
        <FieldDescription>Sent at most once a day.</FieldDescription>
      </FieldSet>
    )
    expect(
      screen.getByRole("group", { name: "Notifications" })
    ).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeVisible()
    expect(screen.getByText("Sent at most once a day.")).toBeVisible()
  })

  it("announces errors once each and renders nothing without them", () => {
    const { rerender } = render(
      <FieldError
        errors={[
          { message: "Enter an email address" },
          { message: "Enter an email address" },
        ]}
      />
    )
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter an email address"
    )
    rerender(
      <FieldError errors={[{ message: "Too short" }, { message: "No @" }]} />
    )
    expect(
      within(screen.getByRole("alert")).getAllByRole("listitem")
    ).toHaveLength(2)
    rerender(<FieldError errors={[]} />)
    expect(screen.queryByRole("alert")).toBeNull()
  })
})

describe("form adapters", () => {
  it("labels the select, marks it invalid, and reports the chosen value", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    render(
      <FormSelectField
        label="Currency"
        value={undefined}
        placeholder="Pick a currency"
        meta={{ errors: ["Choose a currency"] }}
        onValueChange={onValueChange}
      >
        <SelectItem value="usd">US Dollar</SelectItem>
        <SelectItem value="eur">Euro</SelectItem>
      </FormSelectField>
    )
    const trigger = screen.getByRole("combobox", { name: "Currency" })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a currency")
    await user.click(trigger)
    await user.click(await screen.findByRole("option", { name: "Euro" }))
    expect(onValueChange).toHaveBeenCalledWith("eur")
  })

  it("announces form feedback only when there is a message", () => {
    const { rerender } = render(<FormFeedbackField message={null} />)
    expect(screen.queryByRole("alert")).toBeNull()
    rerender(<FormFeedbackField message="Could not save. Try again." />)
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save. Try again."
    )
  })
})

describe("Toaster", () => {
  function renderToaster(props: React.ComponentProps<typeof Toaster> = {}) {
    return render(
      <ThemeProvider forcedTheme="light" enableShortcut={false}>
        <Toaster {...props} />
      </ThemeProvider>
    )
  }

  afterEach(() => {
    act(() => {
      toast.dismiss()
    })
  })

  it("shows a toast() message from the kit's own toast export", async () => {
    renderToaster()
    act(() => {
      toast("Settings saved")
    })
    expect(await screen.findByText("Settings saved")).toBeInTheDocument()
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
    const title = await screen.findByText("Could not save")
    const item = title.closest("[data-sonner-toast]") as HTMLElement
    expect(item).toHaveAttribute("data-type", "error")
    expect(item).toHaveAttribute("data-styled", "false")
    expect(item.className).toContain("bg-popover")
    expect(item.className).toContain("border-destructive/40")
    expect(item.querySelector("[data-icon] svg")).toHaveClass(
      "text-destructive"
    )
    expect(screen.getByText("The server did not respond.")).toBeVisible()
    const retry = screen.getByRole("button", { name: "Retry" })
    expect(retry.className).toContain("bg-primary")
    expect(retry.className).toContain("focus-visible:ring-ring")
    await user.click(retry)
    expect(onRetry).toHaveBeenCalled()
  })

  it("adds a labelled close button and merges app class names", async () => {
    const user = createUser()
    renderToaster({ toastOptions: { classNames: { toast: "app-toast" } } })
    act(() => {
      toast.success("Order archived")
    })
    const item = (await screen.findByText("Order archived")).closest(
      "[data-sonner-toast]"
    ) as HTMLElement
    expect(item.className).toContain("app-toast")
    expect(item.className).toContain("bg-popover")
    await user.click(within(item).getByRole("button", { name: "Close toast" }))
    await waitFor(() => {
      expect(screen.queryByText("Order archived")).toBeNull()
    })
  })
})
