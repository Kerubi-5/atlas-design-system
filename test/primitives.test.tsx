import { describe, expect, it, vi } from "vitest"

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
import { Label } from "../src/label.js"
import { Separator } from "../src/separator.js"
import { Skeleton } from "../src/skeleton.js"
import { Table } from "../src/table.js"
import { TableBodySkeleton } from "../src/table-body-skeleton.js"

import { createUser, render, screen, within } from "./helpers.js"

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
    // Rows are hidden from screen readers (the body is aria-busy), so query
    // the DOM rather than the accessibility tree.
    const rows = document.querySelectorAll("tbody tr")
    expect(rows).toHaveLength(2)
    for (const row of rows) {
      expect(row.querySelectorAll("td")).toHaveLength(3)
    }
    expect(document.querySelectorAll("[data-slot=skeleton]")).toHaveLength(6)
  })

  // Found in the 1.0 audit; failed before its fix.
  it("marks the body busy and hides the placeholder rows", () => {
    render(
      <Table aria-label="Orders">
        <TableBodySkeleton columns={3} rows={2} />
      </Table>
    )
    const table = screen.getByRole("table", { name: "Orders" })
    expect(table.querySelector("tbody")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryAllByRole("cell")).toEqual([])
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

describe("FormFeedbackField", () => {
  it("announces form feedback only when there is a message", () => {
    const { rerender } = render(<FormFeedbackField message={null} />)
    expect(screen.queryByRole("alert")).toBeNull()
    rerender(<FormFeedbackField message="Could not save. Try again." />)
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save. Try again."
    )
  })
})
