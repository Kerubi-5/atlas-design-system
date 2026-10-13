"use client"

import * as React from "react"

import { Input } from "./input.js"
import { Label } from "./label.js"
import {
  foldSearchText,
  handleListboxKey,
  listboxOptionId,
} from "./internal/listbox-navigation.js"
import { ListboxEmptyStatus, ListboxOption } from "./internal/listbox-option.js"
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
  const needle = foldSearchText(query.trim())
  if (!needle) return true
  return foldSearchText(getLabel(item)).includes(needle)
}

export type SearchPickerProps<T> = {
  items: T[]
  getValue: (item: T) => string
  getLabel: (item: T) => string
  filter?: (item: T, query: string, getLabel: (item: T) => string) => boolean
  value?: string
  onSelect: (item: T) => void
  label: string
  placeholder?: string
  emptyText?: string
  listLabel?: string
  disabled?: boolean
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
  emptyText = "No results",
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
        ? items.map((item) => [item, foldSearchText(getLabel(item))] as const)
        : null,
    [filter, getLabel, items]
  )
  const foldedQuery =
    filter === defaultSearchFilter ? foldSearchText(query.trim()) : ""
  const filtered = React.useMemo(() => {
    if (normalizedItems) {
      if (!foldedQuery) return items
      return normalizedItems
        .filter(([, label]) => label.includes(foldedQuery))
        .map(([item]) => item)
    }
    return items.filter((item) => filter(item, query, getLabel))
  }, [items, filter, foldedQuery, getLabel, normalizedItems, query])

  const selectedIndex = React.useMemo(() => {
    const index = filtered.findIndex((item) => getValue(item) === value)
    return index >= 0 ? index : 0
  }, [filtered, getValue, value])

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

  const selectItem = (item: T) => {
    onSelect(item)
    setQuery("")
  }

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
        aria-autocomplete="list"
        aria-activedescendant={
          active ? listboxOptionId(listId, highlight) : undefined
        }
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={listLabel ?? label}
        className={
          empty
            ? "sr-only"
            : cn("max-h-60 overflow-y-auto", listFrame, listClassName)
        }
      >
        {filtered.map((item, index) => {
          const itemValue = getValue(item)
          return (
            <ListboxOption
              key={itemValue}
              data-slot="search-picker-option"
              listId={listId}
              index={index}
              active={index === highlight}
              selected={itemValue === value}
              disabled={disabled}
              className="pr-3"
              onMouseEnter={() => setHighlight(index)}
              onClick={() => selectItem(item)}
            >
              <span className="truncate">{getLabel(item)}</span>
            </ListboxOption>
          )
        })}
      </ul>
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
