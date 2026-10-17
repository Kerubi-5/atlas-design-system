import { describe, expect, it, vi } from "vitest"

import { DatePickerButton } from "../src/date-picker.js"
import { DateTimePickerButton } from "../src/date-time-picker.js"
import { EmptyPanel } from "../src/empty-panel.js"

import { createUser, render, screen } from "./helpers.js"

async function clickClear(trigger: RegExp) {
  const user = createUser()
  await user.click(screen.getByRole("button", { name: trigger }))
  await user.click(await screen.findByRole("button", { name: "Clear" }))
}

describe("onValueChange on the pickers", () => {
  it("range DatePickerButton emits through onValueChange", async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    render(
      <DatePickerButton
        mode="range"
        value={{ from: new Date(2026, 9, 5), to: new Date(2026, 9, 9) }}
        onValueChange={onValueChange}
        onChange={onChange}
      />
    )
    await clickClear(/October 5/)
    expect(onValueChange).toHaveBeenCalledWith(undefined)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("DateTimePickerButton emits through onValueChange", async () => {
    const onValueChange = vi.fn()
    render(
      <DateTimePickerButton
        value={new Date(2026, 9, 10, 14, 30)}
        onValueChange={onValueChange}
      />
    )
    await clickClear(/October 10/)
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it("keeps the deprecated onChange working", async () => {
    const onChange = vi.fn()
    render(
      <DateTimePickerButton
        value={new Date(2026, 9, 10, 14, 30)}
        onChange={onChange}
      />
    )
    await clickClear(/October 10/)
    expect(onChange).toHaveBeenCalledWith(null)
  })
})

describe("EmptyPanel size names", () => {
  it("treats the deprecated md as default", () => {
    render(
      <>
        <EmptyPanel size="default">Default</EmptyPanel>
        <EmptyPanel size="md">Old</EmptyPanel>
      </>
    )
    expect(screen.getByText("Default").className).toMatch(/py-6/)
    expect(screen.getByText("Old").className).toMatch(/py-6/)
  })
})
