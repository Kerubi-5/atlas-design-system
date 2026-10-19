import { describe, expect, it } from "vitest"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../src/accordion.js"
import { Alert } from "../src/alert.js"
import { Avatar } from "../src/avatar.js"
import { Badge } from "../src/badge.js"
import { ColorLegend } from "../src/color-legend.js"
import { EmptyPanel } from "../src/empty-panel.js"
import { ErrorFallback } from "../src/error-boundary.js"
import { Field, FieldGroup, FieldLabel } from "../src/field.js"
import { clamp } from "../src/internal/math.js"
import { Meter } from "../src/meter.js"
import { Pagination } from "../src/pagination.js"
import { Progress } from "../src/progress.js"
import { RadioGroup, RadioGroupItem } from "../src/radio-group.js"
import { Separator } from "../src/separator.js"
import { Slider } from "../src/slider.js"
import { SortableTableHead } from "../src/sortable-table-head.js"
import { StatTile } from "../src/stat-tile.js"
import { Table, TableHeader, TableRow } from "../src/table.js"
import { TableBodySkeleton } from "../src/table-body-skeleton.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsNav,
  TabsTrigger,
} from "../src/tabs.js"
import { classes, render, screen } from "./helpers.js"

/**
 * The kit keeps intrinsic control sizes; apps decide container sizes. These
 * tests pin the two halves: parents stop forcing a width on their children,
 * and a consumer `className` replaces the kit's size class instead of losing
 * to a variant (`data-[size=*]:`, `group-data-[*]:`, `*:`) that twMerge
 * cannot dedupe.
 */

describe("parents leave width to the app", () => {
  it("Field stops forcing its children to full width", () => {
    const { container } = render(
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <input className="w-32" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel className="sr-only">Hidden</FieldLabel>
          <input />
        </Field>
      </FieldGroup>
    )
    for (const field of container.querySelectorAll("[data-slot=field]")) {
      const names = classes(field)
      expect(names.filter((name) => /\*:w-(?:full|auto)/.test(name))).toEqual(
        []
      )
      expect(names).not.toContain("[&>.sr-only]:w-auto")
      expect(names).not.toContain("w-full")
      // Children still fill the column through flex-col's stretch.
      expect(names).toContain("flex-col")
    }
  })

  it("FieldGroup keeps w-full because its inline-size container has no intrinsic width", () => {
    const { container } = render(<FieldGroup />)
    const group = container.querySelector("[data-slot=field-group]")
    expect(classes(group)).toContain("@container/field-group")
    expect(classes(group)).toContain("w-full")
  })

  it("Alert sizes to its container without w-full", () => {
    render(<Alert>Saved</Alert>)
    expect(classes(screen.getByRole("status"))).not.toContain("w-full")
  })

  it("Pagination does not center or stretch itself", () => {
    render(<Pagination />)
    const nav = screen.getByRole("navigation", { name: "Pagination" })
    expect(classes(nav)).toContain("flex")
    for (const name of ["mx-auto", "w-full", "justify-center"]) {
      expect(classes(nav)).not.toContain(name)
    }
  })

  it("Table takes containerClassName and lets className shrink the table", () => {
    render(
      <Table
        aria-label="People"
        className="w-auto"
        containerClassName="max-h-64"
      >
        <TableHeader>
          <TableRow />
        </TableHeader>
      </Table>
    )
    const table = screen.getByRole("table", { name: "People" })
    const container = table.closest("[data-slot=table-container]")
    expect(classes(container)).toContain("max-h-64")
    expect(classes(container)).not.toContain("w-full")
    expect(classes(container)).toContain("min-w-0")
    expect(classes(container)).toContain("max-w-full")
    expect(classes(table)).toContain("w-auto")
    expect(classes(table)).not.toContain("w-full")
    expect(classes(table)).not.toContain("min-w-full")
  })
})

describe("className overrides win", () => {
  it("TabsList height and scroller", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Views" className="h-9" scrollerClassName="h-11">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A panel</TabsContent>
      </Tabs>
    )
    const list = screen.getByRole("tablist", { name: "Views" })
    const scroller = list.closest("[data-slot=tabs-scroller]")
    expect(classes(list)).toContain("h-9")
    expect(classes(list).filter((name) => /(?:^|:)h-7$/.test(name))).toEqual([])
    expect(classes(scroller)).toContain("h-11")
    expect(
      classes(scroller).filter((name) => /(?:^|:)h-9$/.test(name))
    ).toEqual([])
    expect(classes(scroller)).not.toContain("w-full")
  })

  it("vertical TabsList drops the horizontal row height", () => {
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList aria-label="Side">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A panel</TabsContent>
      </Tabs>
    )
    const list = screen.getByRole("tablist", { name: "Side" })
    const scroller = list.closest("[data-slot=tabs-scroller]")
    expect(classes(list)).toContain("flex-col")
    expect(classes(list)).toContain("h-fit")
    expect(classes(list)).not.toContain("h-7")
    expect(classes(scroller)).not.toContain("h-9")
  })

  it("TabsNav takes scrollerClassName and listClassName", () => {
    const { container } = render(
      <TabsNav
        aria-label="Settings"
        scrollerClassName="p-0"
        listClassName="h-9"
      >
        <a href="#a">A</a>
      </TabsNav>
    )
    const scroller = container.querySelector("[data-slot=tabs-scroller]")
    const list = container.querySelector("[data-slot=tabs-list]")
    expect(classes(scroller)).toContain("p-0")
    expect(classes(scroller)).not.toContain("p-1")
    expect(classes(list)).toContain("h-9")
    expect(classes(list)).not.toContain("h-7")
  })

  it("Avatar size", () => {
    const { container } = render(<Avatar className="size-12" />)
    const avatar = container.querySelector("[data-slot=avatar]")
    expect(classes(avatar)).toContain("size-12")
    expect(
      classes(avatar).filter((name) => /size-(?:6|8|10)$/.test(name))
    ).toEqual([])
    expect(avatar).toHaveAttribute("data-size", "default")
  })

  it("Avatar keeps its intrinsic sizes", () => {
    const { container } = render(
      <>
        <Avatar size="sm" />
        <Avatar />
        <Avatar size="lg" />
      </>
    )
    const sizes = [...container.querySelectorAll("[data-slot=avatar]")].map(
      (avatar) => classes(avatar).find((name) => name.startsWith("size-"))
    )
    expect(sizes).toEqual(["size-6", "size-8", "size-10"])
  })

  it("Separator width and height", () => {
    const { container } = render(
      <>
        <Separator className="w-12" />
        <Separator orientation="vertical" className="w-0.5" />
      </>
    )
    const [horizontal, vertical] = container.querySelectorAll(
      "[data-slot=separator]"
    )
    expect(classes(horizontal)).toContain("w-12")
    expect(classes(horizontal)).toContain("h-px")
    expect(
      classes(horizontal).filter((name) => name.endsWith("w-full"))
    ).toEqual([])
    expect(classes(vertical)).toContain("w-0.5")
    expect(classes(vertical)).toContain("self-stretch")
    expect(classes(vertical).filter((name) => name.endsWith("w-px"))).toEqual(
      []
    )
  })

  it("Badge icon size yields to an icon's own size class", () => {
    render(<Badge>New</Badge>)
    const badge = screen.getByText("New")
    expect(classes(badge)).not.toContain("[&>svg]:size-3!")
    expect(classes(badge)).toContain("[&>svg:not([class*='size-'])]:size-3")
  })
})

describe("slots and pass-through props", () => {
  it("SortableTableHead names its button and takes buttonClassName", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableTableHead buttonClassName="w-full justify-between">
              Name
            </SortableTableHead>
          </tr>
        </thead>
      </table>
    )
    const button = screen.getByRole("button", { name: "Name" })
    expect(button).toHaveAttribute("data-slot", "sortable-table-head-button")
    expect(classes(button)).toContain("justify-between")
  })

  it("StatTile slots and root props", () => {
    render(
      <StatTile
        label="Spend"
        value="$10"
        sub="this week"
        id="spend"
        aria-label="Spend tile"
      />
    )
    const tile = document.getElementById("spend")!
    expect(tile).toHaveAttribute("data-slot", "stat-tile")
    expect(tile).toHaveAttribute("aria-label", "Spend tile")
    expect(screen.getByText("Spend")).toHaveAttribute(
      "data-slot",
      "stat-tile-label"
    )
    expect(screen.getByText("$10")).toHaveAttribute(
      "data-slot",
      "stat-tile-value"
    )
    expect(screen.getByText("this week")).toHaveAttribute(
      "data-slot",
      "stat-tile-sub"
    )
  })

  it("Accordion header and inner content slots", () => {
    const { container } = render(
      <Accordion type="single" defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger headerClassName="px-4">Question</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    const header = container.querySelector("[data-slot=accordion-header]")
    expect(header).toBeTruthy()
    expect(classes(header)).toContain("flex")
    expect(classes(header)).toContain("px-4")
    expect(screen.getByText("Answer")).toHaveAttribute(
      "data-slot",
      "accordion-content-inner"
    )
  })

  it("Progress indicatorClassName", () => {
    const { container } = render(
      <Progress value={40} indicatorClassName="bg-success" />
    )
    const indicator = container.querySelector("[data-slot=progress-indicator]")
    expect(classes(indicator)).toContain("bg-success")
    expect(classes(indicator)).not.toContain("bg-primary")
  })

  it("Slider passes other props to the Radix root", () => {
    const { container } = render(
      <Slider
        value={5}
        onValueChange={() => {}}
        aria-label="Volume"
        data-testid="volume"
        orientation="horizontal"
      />
    )
    const root = container.querySelector("[data-slot=slider]")
    expect(root).toHaveAttribute("data-testid", "volume")
    expect(screen.getByRole("slider", { name: "Volume" })).toBeTruthy()
  })

  it("ColorLegend slots and root props", () => {
    const { container } = render(
      <ColorLegend
        id="legend"
        title="Depth"
        items={[{ color: "red", range: "0–1", label: "Shallow" }]}
      />
    )
    const root = container.querySelector("#legend")
    expect(root).toHaveAttribute("data-slot", "color-legend")
    expect(
      container.querySelector("[data-slot=color-legend-item]")
    ).toBeTruthy()
    expect(
      container.querySelector("[data-slot=color-legend-swatch]")
    ).toBeTruthy()
    expect(screen.getByText("0–1")).toHaveAttribute(
      "data-slot",
      "color-legend-range"
    )
    expect(classes(screen.getByText("Depth"))).toContain("tracking-widest")
  })

  it("EmptyPanel slot and props", () => {
    render(
      <EmptyPanel id="empty" role="status">
        Nothing yet
      </EmptyPanel>
    )
    const panel = screen.getByRole("status")
    expect(panel).toHaveAttribute("data-slot", "empty-panel")
    expect(panel).toHaveAttribute("id", "empty")
  })

  it("Meter passes props to its root", () => {
    render(<Meter value={3} max={10} aria-label="Usage" id="usage" />)
    const meter = screen.getByRole("meter", { name: "Usage" })
    expect(meter).toHaveAttribute("id", "usage")
    expect(meter).toHaveAttribute("aria-valuenow", "3")
  })

  it("RadioGroup dot slot", () => {
    const { container } = render(
      <RadioGroup defaultValue="a" aria-label="Pick">
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>
    )
    expect(container.querySelector("[data-slot=radio-group-dot]")).toBeTruthy()
  })

  it("TableBodySkeleton className", () => {
    const { container } = render(
      <table>
        <TableBodySkeleton columns={1} rows={1} className="opacity-60" />
      </table>
    )
    const body = container.querySelector("[data-slot=table-body]")
    expect(classes(body)).toContain("opacity-60")
  })

  it("ErrorFallback className", () => {
    render(<ErrorFallback className="py-16" />)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveAttribute("data-slot", "error-boundary")
    expect(classes(alert)).toContain("py-16")
    expect(classes(alert)).not.toContain("py-8")
  })
})

describe("clamp", () => {
  it("bounds a number and passes NaN through for the caller to handle", () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
    expect(clamp(Number.NaN, 0, 10)).toBeNaN()
  })
})
