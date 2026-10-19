import { describe, expect, it } from "vitest"

import { Combobox } from "../src/combobox.js"
import { DateTimePickerButton } from "../src/date-time-picker.js"
import { Dialog, DialogContent, DialogTitle } from "../src/dialog.js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../src/dropdown-menu.js"
import { InfoTip } from "../src/info-tip.js"
import { Popover, PopoverContent, PopoverTrigger } from "../src/popover.js"
import { SearchPicker } from "../src/search-picker.js"
import { Table } from "../src/table.js"
import { TableBodySkeleton } from "../src/table-body-skeleton.js"
import { TabsNav } from "../src/tabs.js"
import { classes, createUser, render, screen } from "./helpers.js"

/**
 * Apps decide how wide and tall containers and overlays are. The kit keeps
 * intrinsic control sizes (button and input heights, icons, checkboxes) and
 * viewport clamps that stop overlays leaving the screen, but no design
 * widths or heights an app would have to fight.
 */
const sizeClass = /^(?:[a-z0-9-]+:)*(?:min-|max-)?(?:w|h)-/

describe("consumer sizing", () => {
  it("leaves dialog and popover widths to the app", () => {
    render(
      <>
        <Popover open>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Body</PopoverContent>
        </Popover>
        <Dialog open>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      </>
    )

    const dialog = screen.getByRole("dialog", { name: "Title" })
    expect(classes(dialog)).not.toContain("sm:max-w-md")

    const popover = screen.getByText("Body")
    expect(classes(popover)).not.toContain("w-72")
  })

  it("leaves menu width to the app", async () => {
    const user = createUser()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    await user.click(screen.getByRole("button", { name: "Menu" }))
    const menu = await screen.findByRole("menu")
    expect(classes(menu)).not.toContain("min-w-40")
  })

  it("lets TabsNav size to its links in a flex row", () => {
    render(
      <div className="flex">
        <TabsNav aria-label="Views">
          <a href="#a">A</a>
        </TabsNav>
        <button type="button">New</button>
      </div>
    )

    // w-full made the nav take the whole row and squeeze its neighbours.
    // As a block it still fills a normal container; min-w-0 lets it shrink
    // and scroll in a row.
    const nav = screen.getByRole("navigation", { name: "Views" })
    expect(classes(nav)).not.toContain("w-full")
    expect(classes(nav)).toContain("min-w-0")
  })

  it("lets the app size the InfoTip panel", async () => {
    const user = createUser()
    render(
      <InfoTip label="About depth" title="Depth" contentClassName="w-96" />
    )

    await user.click(screen.getByRole("button", { name: "About depth" }))
    const title = await screen.findByText("Depth")
    const panel = title.closest("[data-slot=popover-content]")!
    expect(classes(panel)).toContain("w-96")
    expect(classes(panel)).not.toContain("w-72")
  })

  it("lets the app size picker lists", async () => {
    const user = createUser()
    render(
      <>
        <Combobox
          options={[{ value: "php", label: "PHP" }]}
          onValueChange={() => {}}
          listClassName="max-h-96"
        />
        <SearchPicker
          items={[{ id: "1", name: "Manila" }]}
          getValue={(item) => item.id}
          getLabel={(item) => item.name}
          onSelect={() => {}}
          label="Place"
          listClassName="max-h-none"
        />
      </>
    )

    const place = screen.getByRole("listbox", { name: "Place" })
    expect(classes(place)).toContain("max-h-none")
    expect(classes(place)).not.toContain("max-h-60")

    await user.click(screen.getByRole("combobox", { name: "" }))
    const listboxes = await screen.findAllByRole("listbox")
    const options = listboxes.find((list) => list !== place)!
    expect(classes(options)).toContain("max-h-96")
    expect(classes(options)).not.toContain("max-h-60")
  })

  it("draws skeleton bars and the date-time panel without design caps", async () => {
    const user = createUser()
    const { container } = render(
      <>
        <Table>
          <TableBodySkeleton columns={1} rows={1} />
        </Table>
        <DateTimePickerButton value={null} onChange={() => {}} />
      </>
    )

    const bar = container.querySelector("[data-slot=skeleton]")!
    expect(classes(bar).filter((name) => name.startsWith("max-w-"))).toEqual([])

    await user.click(screen.getByRole("button", { name: /pick/i }))
    const panel = await screen.findByRole("dialog")
    expect(
      classes(panel).filter(
        (name) => sizeClass.test(name) && name.includes("24rem")
      )
    ).toEqual([])
  })
})
