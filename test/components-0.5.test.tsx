import { useState } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../src/accordion.js"
import { Alert, AlertDescription, AlertTitle } from "../src/alert.js"
import { Avatar, AvatarFallback, AvatarImage } from "../src/avatar.js"
import { Button } from "../src/button.js"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../src/dropdown-menu.js"
import { Label } from "../src/label.js"
import { Progress } from "../src/progress.js"
import { RadioGroup, RadioGroupItem } from "../src/radio-group.js"
import { Spinner } from "../src/spinner.js"
import { Switch } from "../src/switch.js"
import { Tooltip, TooltipContent, TooltipTrigger } from "../src/tooltip.js"
import { BreadcrumbStory, PaginationStory } from "../stories/wayfinding.js"

import { createUser, render, screen, waitFor } from "./helpers.js"

describe("Tooltip", () => {
  it("opens on keyboard focus and describes the trigger", async () => {
    const user = createUser()
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" aria-label="Edit">
            E
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit order</TooltipContent>
      </Tooltip>
    )

    await user.tab()
    const tooltip = await screen.findByRole("tooltip")
    expect(tooltip).toHaveTextContent("Edit order")
    expect(screen.getByRole("button", { name: "Edit" })).toHaveAttribute(
      "aria-describedby",
      tooltip.id
    )

    await user.keyboard("{Escape}")
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
    })
  })
})

describe("DropdownMenu", () => {
  function Menu({ onEdit }: { onEdit: () => void }) {
    const [archived, setArchived] = useState(false)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Order 1042</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuCheckboxItem
            checked={archived}
            onCheckedChange={setArchived}
          >
            Show archived
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  it("opens from the keyboard, moves with arrows, and runs the item", async () => {
    const user = createUser()
    const onEdit = vi.fn()
    render(<Menu onEdit={onEdit} />)

    screen.getByRole("button", { name: "Actions" }).focus()
    await user.keyboard("{Enter}")
    const menu = await screen.findByRole("menu")
    expect(menu.className).toContain("rounded-none")
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus()
    })

    await user.keyboard("{Enter}")
    expect(onEdit).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    })
    expect(screen.getByRole("button", { name: "Actions" })).toHaveFocus()
  })

  it("toggles a checkbox item and marks destructive items", async () => {
    const user = createUser()
    render(<Menu onEdit={() => {}} />)

    await user.click(screen.getByRole("button", { name: "Actions" }))
    const archived = await screen.findByRole("menuitemcheckbox", {
      name: "Show archived",
    })
    expect(archived).toHaveAttribute("aria-checked", "false")
    await user.click(archived)

    await user.click(screen.getByRole("button", { name: "Actions" }))
    expect(
      await screen.findByRole("menuitemcheckbox", { name: "Show archived" })
    ).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "destructive"
    )
    // A missing `inset` must not render data-inset="false" (it would match).
    expect(
      screen.getByRole("menuitem", { name: "Delete" })
    ).not.toHaveAttribute("data-inset")
  })
})

describe("Switch", () => {
  it("toggles from its label and exposes the switch role", async () => {
    const user = createUser()
    const onCheckedChange = vi.fn()
    render(
      <>
        <Switch id="digest" onCheckedChange={onCheckedChange} />
        <Label htmlFor="digest">Weekly digest</Label>
      </>
    )

    const toggle = screen.getByRole("switch", { name: "Weekly digest" })
    expect(toggle).toHaveAttribute("aria-checked", "false")
    expect(toggle.className).toContain("rounded-none")

    await user.click(screen.getByText("Weekly digest"))
    expect(toggle).toHaveAttribute("aria-checked", "true")
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)

    await user.keyboard(" ")
    expect(toggle).toHaveAttribute("aria-checked", "false")
  })
})

describe("RadioGroup", () => {
  it("moves the selection with arrow keys", async () => {
    const user = createUser()
    const onValueChange = vi.fn()
    render(
      <RadioGroup
        defaultValue="daily"
        onValueChange={onValueChange}
        aria-label="Frequency"
      >
        {["daily", "weekly", "monthly"].map((value) => (
          <div key={value}>
            <RadioGroupItem value={value} id={value} />
            <Label htmlFor={value}>{value}</Label>
          </div>
        ))}
      </RadioGroup>
    )

    expect(screen.getByRole("radiogroup", { name: "Frequency" })).toBeVisible()
    const daily = screen.getByRole("radio", { name: "daily" })
    expect(daily).toBeChecked()
    expect(daily.className).toContain("rounded-full")

    await user.click(daily)
    // Radix selects on focus only while the arrow key is held, and moves
    // focus asynchronously, so hold the key until the selection follows.
    await user.keyboard("{ArrowDown>}")
    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "weekly" })).toBeChecked()
    })
    await user.keyboard("{/ArrowDown}")
    expect(onValueChange).toHaveBeenLastCalledWith("weekly")
  })
})

describe("Accordion", () => {
  it("expands and collapses a section from its trigger", async () => {
    const user = createUser()
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>When do exports run?</AccordionTrigger>
          <AccordionContent>Every night.</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByRole("button", { name: "When do exports run?" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region")).toHaveTextContent("Every night.")

    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })
})

describe("Avatar", () => {
  it("shows the fallback while the image has not loaded", () => {
    render(
      <Avatar size="lg">
        <AvatarImage src="/missing.png" alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText("AL")
    expect(fallback.className).toContain("rounded-full")
    expect(fallback.closest("[data-slot=avatar]")).toHaveAttribute(
      "data-size",
      "lg"
    )
  })
})

describe("Alert", () => {
  it("announces destructive alerts and keeps others polite", () => {
    render(
      <>
        <Alert variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>Try again.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <AlertTitle>Saved</AlertTitle>
        </Alert>
      </>
    )
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Could not save")
    expect(alert.className).toContain("rounded-none")
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
    // Body text stays muted rather than taking the status tone.
    expect(screen.getByText("Try again.").className).toContain(
      "text-muted-foreground"
    )
  })
})

describe("Pagination and Breadcrumb", () => {
  it("marks the current page and labels the landmarks", () => {
    render(
      <>
        <PaginationStory />
        <BreadcrumbStory />
      </>
    )

    const pagination = screen.getByRole("navigation", { name: "Pagination" })
    const current = pagination.querySelector('[aria-current="page"]')
    expect(current).toHaveTextContent("2")
    expect(current?.className).toContain("bg-selected")
    expect(
      screen.getByRole("link", { name: "Go to previous page" })
    ).toHaveAttribute("href", "#page-1")
    expect(
      screen.getByRole("link", { name: "Go to next page" })
    ).toHaveAttribute("href", "#page-3")

    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" })
    expect(breadcrumb.querySelector('[aria-current="page"]')).toHaveTextContent(
      "Order 1042"
    )
    expect(screen.getByRole("link", { name: "Orders" })).toHaveAttribute(
      "href",
      "#orders"
    )
    for (const separator of breadcrumb.querySelectorAll(
      "[data-slot=breadcrumb-separator]"
    )) {
      expect(separator).toHaveAttribute("aria-hidden", "true")
    }
  })
})

describe("Progress and Spinner", () => {
  it("expose progress and loading state to assistive tech", () => {
    const html = renderToStaticMarkup(
      <>
        <Progress value={40} aria-label="Upload" />
        <Spinner />
        <Spinner aria-label="Saving" />
      </>
    )
    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="40"')
    expect(html).toContain("translateX(-60%)")
    expect(html).toContain('role="status" aria-label="Loading"')
    expect(html).toContain('aria-label="Saving"')
    expect(html).not.toContain('aria-hidden="true"')
  })
})
