import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

/**
 * Shared Testing Library entry for kit behavior tests.
 * Prefer roles, labels, and attributes a consumer relies on.
 */
export function createUser() {
  return userEvent.setup()
}

export { render, screen, waitFor, within }
