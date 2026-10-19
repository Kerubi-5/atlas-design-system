import { describe, expect, it } from "vitest"

import { Alert, AlertDescription, AlertTitle } from "../src/alert.js"

import { render, screen } from "./helpers.js"

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
