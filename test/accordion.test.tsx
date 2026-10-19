import { describe, expect, it } from "vitest"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../src/accordion.js"

import { createUser, render, screen } from "./helpers.js"

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
