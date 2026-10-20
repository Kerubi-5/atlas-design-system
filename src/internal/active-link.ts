/** How NavLink and TabsNavLink mark the current page (`selectedState.active`). */
export function activeLinkAttributes(active: boolean) {
  return {
    "data-state": active ? "active" : "inactive",
    "aria-current": active ? ("page" as const) : undefined,
  }
}

/** A link marked by `activeLinkAttributes`, or an active Radix tab. */
export const activeLinkSelector = '[aria-current="page"], [data-state="active"]'
