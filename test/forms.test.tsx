import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FieldError, getFieldErrorMessage } from "../src/form/field-error.js"
import { FormTextField } from "../src/form/text-field.js"
import { cn, onInputChange } from "../src/utils.js"

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
    const field = {
      name: "title",
      state: { value: "Draft", meta: { errors: ["Required"] } },
      handleChange: () => {},
      handleBlur: () => {},
    }
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

  it("keeps utility class precedence and controlled input values", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4")
    let value = ""
    onInputChange((next) => {
      value = next
    })({ target: { value: "Changed" } } as React.ChangeEvent<HTMLInputElement>)
    expect(value).toBe("Changed")
  })
})
