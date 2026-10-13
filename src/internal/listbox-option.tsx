import * as React from "react"

import { cn } from "../utils.js"
import { listboxOptionId, scrollOptionIntoView } from "./listbox-navigation.js"
import { optionRow } from "./overlay-styles.js"
import { listboxEmpty, optionState } from "./styles.js"

type ListboxOptionProps = Omit<
  React.ComponentProps<"button">,
  "id" | "role" | "type" | "tabIndex" | "aria-selected"
> & {
  /** The listbox id; the option id derives from it for aria-activedescendant. */
  listId: string
  index: number
  /** Keyboard or pointer highlight (tracked in state, not DOM focus). */
  active: boolean
  selected: boolean
}

/**
 * One option of a search-driven listbox (Combobox, SearchPicker): a
 * non-focusable button in a presentational `li`, highlighted by state and
 * scrolled into view while active. Pass `data-slot`, handlers, and the
 * component's right padding and indicator.
 */
export function ListboxOption({
  listId,
  index,
  active,
  selected,
  className,
  ...props
}: ListboxOptionProps) {
  return (
    <li role="none">
      <button
        ref={active ? scrollOptionIntoView : undefined}
        id={listboxOptionId(listId, index)}
        type="button"
        role="option"
        tabIndex={-1}
        aria-selected={selected}
        className={cn(
          optionRow,
          selected && optionState.selected,
          active && optionState.active,
          className
        )}
        {...props}
      />
    </li>
  )
}

/**
 * The "No results" status. It sits outside the listbox, which may own only
 * options, and stays mounted (sr-only when not empty) so screen readers
 * announce the empty state as the query changes.
 */
export function ListboxEmptyStatus({
  empty,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "role"> & { empty: boolean }) {
  return (
    <div
      role="status"
      className={empty ? cn(listboxEmpty, className) : "sr-only"}
      {...props}
    >
      {empty ? children : null}
    </div>
  )
}
