import { describe, expect, it } from "vitest"

import { Button } from "../src/button.js"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../src/tooltip.js"

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

  it("opens on hover without delay unless an app provider sets one", async () => {
    const user = createUser()
    const { unmount } = render(
      <Tooltip>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent>Save draft</TooltipContent>
      </Tooltip>
    )
    await user.hover(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Save draft")
    unmount()

    render(
      <TooltipProvider delayDuration={5000}>
        <Tooltip>
          <TooltipTrigger>Save</TooltipTrigger>
          <TooltipContent>Save draft</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    await user.hover(screen.getByRole("button", { name: "Save" }))
    // Well under the 5s delay the app asked for.
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
  })
})
