import { describe, expect, it } from "vitest"

import { Badge } from "../src/badge.js"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../src/card.js"
import { EmptyPanel } from "../src/empty-panel.js"
import { Input } from "../src/input.js"
import { Label } from "../src/label.js"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/table.js"

import {
  CardContentPx0Story,
  FlexColumnCardsStory,
} from "../stories/card-layout.js"

import { render, screen } from "./helpers.js"

describe("Badge", () => {
  it("exposes variant and tone styling", () => {
    const { rerender } = render(<Badge>Default</Badge>)
    expect(screen.getByText("Default")).toHaveAttribute(
      "data-variant",
      "default"
    )

    rerender(
      <Badge variant="soft" tone="success">
        Paid
      </Badge>
    )
    const paid = screen.getByText("Paid")
    expect(paid).toHaveAttribute("data-variant", "soft")
    expect(paid.className).toMatch(/bg-success\/15/)
    expect(paid.className).toMatch(/text-success/)

    rerender(
      <Badge variant="soft" tone="warning">
        Due
      </Badge>
    )
    expect(screen.getByText("Due").className).toMatch(/text-warning/)

    rerender(
      <Badge variant="soft" tone="destructive">
        Failed
      </Badge>
    )
    expect(screen.getByText("Failed").className).toMatch(/text-destructive/)

    rerender(<Badge variant="secondary">Quiet</Badge>)
    expect(screen.getByText("Quiet")).toHaveAttribute(
      "data-variant",
      "secondary"
    )
    expect(screen.getByText("Quiet").className).toMatch(/text-muted-foreground/)
  })
})

describe("Input and Label", () => {
  it("associates the label and forwards invalid state", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          aria-invalid
          placeholder="name@example.com"
        />
      </>
    )

    const field = screen.getByLabelText("Email")
    expect(field).toHaveAttribute("data-slot", "input")
    expect(field).toHaveAttribute("type", "email")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(field).toHaveAttribute("placeholder", "name@example.com")
    expect(field.className).toMatch(/rounded-none/)
    expect(screen.getByText("Email")).toHaveAttribute("data-slot", "label")
  })
})

describe("Card", () => {
  it("renders composed sections and size or flush attributes", () => {
    const { rerender } = render(
      <Card>
        <CardHeader>
          <CardTitle as="h1">Budget</CardTitle>
          <CardDescription>October export</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    )

    const card = screen.getByText("Budget").closest("[data-slot=card]")
    expect(card).toHaveAttribute("data-size", "default")
    expect(screen.getByRole("heading", { name: "Budget" })).toHaveAttribute(
      "data-slot",
      "card-title"
    )
    expect(screen.getByText("October export")).toHaveAttribute(
      "data-slot",
      "card-description"
    )

    rerender(
      <Card size="sm" flush>
        <CardContent>Flush</CardContent>
      </Card>
    )
    const flush = screen.getByText("Flush").closest("[data-slot=card]")
    expect(flush).toHaveAttribute("data-size", "sm")
    expect(flush?.className ?? "").toMatch(/\[--card-p:0px\]/)
    expect(flush?.className.split(/\s+/)).toContain("min-h-min")
    expect(flush?.className.split(/\s+/)).toContain("min-w-0")
    expect(flush?.className.split(/\s+/)).toContain("shrink-0")
    expect(flush?.className.split(/\s+/)).toContain("overflow-hidden")
    expect(flush?.className ?? "").not.toMatch(/py-\(--card-p\)/)
  })

  it("does not shrink below content in a bounded flex column", () => {
    render(<FlexColumnCardsStory />)
    const cards = document.querySelectorAll("[data-slot=card]")
    expect(cards).toHaveLength(2)
    for (const card of cards) {
      expect(card.className.split(/\s+/)).toContain("min-h-min")
      expect(card.className.split(/\s+/)).toContain("min-w-0")
      expect(card.className.split(/\s+/)).toContain("shrink-0")
      expect(card.className.split(/\s+/)).toContain("overflow-hidden")
    }
    expect(screen.getByText(/must not collapse/)).toBeInTheDocument()
  })

  it("lets CardContent px-0 override padding without an important class", () => {
    render(<CardContentPx0Story />)
    const content = screen.getByText("Full-bleed body")
    expect(content).toHaveAttribute("data-slot", "card-content")
    expect(content.className.split(/\s+/)).toContain("px-0")
    expect(content.className).not.toMatch(/px-\(--card-p\)/)
    expect(content.className.split(/\s+/)).not.toContain("!px-0")
  })
})

describe("Table", () => {
  it("exposes native table roles", () => {
    render(
      <Table>
        <TableCaption>People</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByRole("table", { name: "People" })).toHaveAttribute(
      "data-slot",
      "table"
    )
    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Ada" })).toBeInTheDocument()
    expect(screen.getByRole("row", { name: "Ada" })).toHaveAttribute(
      "data-state",
      "selected"
    )
  })
})

describe("EmptyPanel", () => {
  it("renders empty copy with size and muted styles", () => {
    const { rerender } = render(<EmptyPanel>No rows yet.</EmptyPanel>)
    const panel = screen.getByText("No rows yet.")
    expect(panel.className).toMatch(/border-dashed/)
    expect(panel.className).toMatch(/bg-muted\/30/)
    expect(panel.className).toMatch(/py-6/)

    rerender(
      <EmptyPanel size="sm" muted={false}>
        Compact
      </EmptyPanel>
    )
    expect(screen.getByText("Compact").className).toMatch(/py-4/)
    expect(screen.getByText("Compact").className).not.toMatch(/bg-muted\/30/)

    rerender(<EmptyPanel size="lg">Wide</EmptyPanel>)
    expect(screen.getByText("Wide").className).toMatch(/py-8/)
  })
})
