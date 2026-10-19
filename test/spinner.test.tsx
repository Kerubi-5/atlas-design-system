import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Spinner } from "../src/spinner.js"

describe("Spinner", () => {
  it("exposes loading state to assistive tech", () => {
    const html = renderToStaticMarkup(
      <>
        <Spinner />
        <Spinner aria-label="Saving" />
      </>
    )
    expect(html).toContain('role="status" aria-label="Loading"')
    expect(html).toContain('aria-label="Saving"')
    expect(html).not.toContain('aria-hidden="true"')
  })
})
