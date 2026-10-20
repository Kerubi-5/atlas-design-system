"use client"

import * as React from "react"

import { Input } from "./input.js"
import { Label } from "./label.js"
import { handleListboxKey } from "./internal/listbox-navigation.js"
import {
  Listbox,
  ListboxEmptyStatus,
  listboxInputAria,
  PickerOption,
} from "./internal/listbox-option.js"
import {
  createSearchIndex,
  filterSearchIndex,
  foldSearchText,
  normalizeSearchQuery,
} from "./internal/search.js"
import { cn } from "./utils.js"

export { foldSearchText }

/**
 * Default SearchPicker filter: the folded label includes the folded query.
 */
export function defaultSearchFilter<T>(
  item: T,
  query: string,
  getLabel: (item: T) => string
) {
  const needle = normalizeSearchQuery(query)
  if (!needle) return true
  return foldSearchText(getLabel(item)).includes(needle)
}

export type SearchPickerProps<T> = {
  /** Every choice, in display order. */
  items: T[]
  /** A unique, stable value for an item; matched against `value`. */
  getValue: (item: T) => string
  /** The item's visible text, also what the default filter searches. */
  getLabel: (item: T) => string
  /** Whether an item matches the query. Default `defaultSearchFilter` (label contains query, ignoring case and accents). */
  filter?: (item: T, query: string, getLabel: (item: T) => string) => boolean
  /** The selected item's value, marked in the list. */
  value?: string
  /** Called with the item picked by click or Enter; the query then clears. */
  onSelect: (item: T) => void
  /** Visible label for the search input. */
  label: string
  /** Placeholder for the search input. Default `"Search"`. */
  placeholder?: string
  /** Text shown when nothing matches the query. Default `"No results"`. */
  emptyText?: string
  /** Accessible name for the listbox. Defaults to `label`. */
  listLabel?: string
  /** Disables the input and every option. */
  disabled?: boolean
  /** Classes for the wrapper, e.g. its width. */
  className?: string
  /** Classes for the listbox, e.g. its height. Defaults to `max-h-60`. */
  listClassName?: string
} & Omit<React.ComponentProps<"div">, "children" | "onSelect" | "defaultValue">

/** Frame shared by the listbox and the empty state that replaces it. */
const listFrame = "border border-input bg-background"

/**
 * Always-visible combobox: a labelled input and a listbox. Unlike Combobox,
 * the list is not in a popover. Keyboard: arrows, Home/End, PageUp/PageDown,
 * Enter, Escape.
 */
function SearchPicker<T>({
  items,
  getValue,
  getLabel,
  filter = defaultSearchFilter,
  value,
  onSelect,
  label,
  placeholder = "Search",
  emptyText,
  listLabel,
  disabled,
  className,
  listClassName,
  ...props
}: SearchPickerProps<T>) {
  const [query, setQuery] = React.useState("")
  const listId = React.useId()
  const inputId = React.useId()

  const normalizedItems = React.useMemo(
    () =>
      filter === defaultSearchFilter
        ? createSearchIndex(items, getLabel)
        : null,
    [filter, getLabel, items]
  )
  const foldedQuery =
    filter === defaultSearchFilter ? normalizeSearchQuery(query) : ""
  const filtered = React.useMemo(() => {
    if (normalizedItems) return filterSearchIndex(normalizedItems, foldedQuery)
    return items.filter((item) => filter(item, query, getLabel))
  }, [items, filter, foldedQuery, getLabel, normalizedItems, query])

  const selectedIndex = React.useMemo(() => {
    const index = filtered.findIndex((item) => getValue(item) === value)
    return index >= 0 ? index : 0
  }, [filtered, getValue, value])

  const rows = React.useMemo(
    () => filtered.map((item) => ({ item, value: getValue(item) })),
    [filtered, getValue]
  )

  const [highlight, setHighlight] = React.useState(selectedIndex)

  // Reset the highlight while rendering, not in an effect, when the query or
  // the selected row changes: an effect commits every keystroke twice, once
  // with the stale highlight and again with the reset.
  const [highlightFor, setHighlightFor] = React.useState({
    query,
    selectedIndex,
  })
  if (
    highlightFor.query !== query ||
    highlightFor.selectedIndex !== selectedIndex
  ) {
    setHighlightFor({ query, selectedIndex })
    setHighlight(query ? 0 : selectedIndex)
  }

  const active = filtered[highlight]
  const empty = filtered.length === 0

  const selectItem = React.useCallback(
    (item: T) => {
      onSelect(item)
      setQuery("")
    },
    [onSelect]
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const handled = handleListboxKey(event, {
      highlight,
      length: filtered.length,
      setHighlight,
      onEnter: (index) => {
        const item = filtered[index]
        if (item) selectItem(item)
      },
    })
    if (handled || event.key !== "Escape") return
    event.preventDefault()
    if (query) {
      setQuery("")
      return
    }
    event.currentTarget.blur()
  }

  return (
    <div
      data-slot="search-picker"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        role="combobox"
        aria-expanded
        aria-controls={listId}
        {...listboxInputAria(listId, active ? highlight : undefined)}
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <Listbox
        id={listId}
        empty={empty}
        aria-label={listLabel ?? label}
        className={cn(listFrame, listClassName)}
      >
        {rows.map(({ item, value: itemValue }, index) => (
          <PickerOption
            key={itemValue}
            data-slot="search-picker-option"
            listId={listId}
            index={index}
            active={index === highlight}
            selected={itemValue === value}
            disabled={disabled}
            item={item}
            getLabel={getLabel}
            onHighlight={setHighlight}
            onSelect={selectItem}
          />
        ))}
      </Listbox>
      <ListboxEmptyStatus
        data-slot="search-picker-empty"
        empty={empty}
        className={listFrame}
      >
        {emptyText}
      </ListboxEmptyStatus>
    </div>
  )
}

export { SearchPicker }
