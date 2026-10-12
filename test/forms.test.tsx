import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FieldError, getFieldErrorMessage } from "../src/form/field-error.js"
import { FormMarkdownField } from "../src/form/markdown-field.js"
import { FormTextField } from "../src/form/text-field.js"
import { cn, onInputChange } from "../src/utils.js"

import { createUser, fakeTextField, render, screen } from "./helpers.js"

describe("portable forms", () => {
  it("preserves error messages and suppresses absent errors", () => {
    expect(getFieldErrorMessage("Required")).toBe("Required")
    expect(getFieldErrorMessage({ message: "Invalid" })).toBe("Invalid")
    expect(getFieldErrorMessage(undefined)).toBeUndefined()
    expect(
      renderToStaticMarkup(<FieldError message={{ message: "Required" }} />)
    ).toContain('role="alert"')
    expect(renderToStaticMarkup(<FieldError />)).toBe("")
  })

  it("keeps field labels, values, invalid state, and multiline behavior", () => {
    const field = fakeTextField("title", "Draft", ["Required"])
    const html = renderToStaticMarkup(
      <FormTextField field={field} label="Title" />
    )
    expect(html).toContain('for="title"')
    expect(html).toContain('value="Draft"')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('role="alert"')
    const multiline = renderToStaticMarkup(
      <FormTextField
        field={field}
        label="Title"
        multiline
        rows={5}
        showError={false}
      />
    )
    expect(multiline).toContain("<textarea")
    expect(multiline).toContain('rows="5"')
    expect(multiline).not.toContain('aria-invalid="true"')
    expect(multiline).not.toContain('role="alert"')
  })

  it("accepts an id so two forms can share a field name", () => {
    const field = fakeTextField("email", "")
    const html = renderToStaticMarkup(
      <>
        <FormTextField field={field} label="Login email" />
        <FormTextField field={field} id="signup-email" label="Sign-up email" />
      </>
    )
    expect(html).toContain('for="email"')
    expect(html).toContain('id="email"')
    expect(html).toContain('for="signup-email"')
    expect(html).toContain('id="signup-email"')
  })

  it("toggles markdown write and preview", async () => {
    const field = fakeTextField("notes", "## Hello", ["Required"])
    const user = createUser()
    render(<FormMarkdownField field={field} label="Notes" />)

    expect(screen.getByLabelText("Notes")).toHaveValue("## Hello")
    expect(screen.getByRole("alert")).toHaveTextContent("Required")
    expect(
      screen.getByRole("radiogroup", { name: "Notes mode" })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Preview" }))
    // The renderer loads on first preview, so the heading arrives async.
    expect(
      await screen.findByRole("heading", { name: "Hello" })
    ).toBeInTheDocument()
    expect(screen.queryByLabelText("Notes")).not.toBeInTheDocument()
  })

  it("keeps utility class precedence and controlled input values", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4")
    let value = ""
    onInputChange((next) => {
      value = next
    })({ target: { value: "Changed" } } as React.ChangeEvent<HTMLInputElement>)
    expect(value).toBe("Changed")
  })
})
