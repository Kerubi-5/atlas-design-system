"use client"

import * as React from "react"

import { Input } from "./input.js"
import { Label } from "./label.js"
import {
  listboxOptionId,
  moveListboxHighlight,
  scrollOptionIntoView,
} from "./internal/listbox-navigation.js"
import { listboxEmpty, optionState } from "./internal/styles.js"
import { cn } from "./utils.js"

/**
 * Case-fold and strip combining marks so "nino" matches "Niño".
 */
export function foldSearchText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

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
}

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

  React.useEffect(() => {
    setHighlight(query ? 0 : selectedIndex)
  }, [query, selectedIndex])

  const active = filtered[highlight]

  const selectItem = (item: T) => {
    onSelect(item)
    setQuery("")
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const nextHighlight = moveListboxHighlight(
      event.key,
      highlight,
      filtered.length
    )
    if (nextHighlight !== undefined) {
      event.preventDefault()
      setHighlight(nextHighlight)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      if (active) selectItem(active)
    }
    if (event.key === "Escape") {
      event.preventDefault()
      if (query) {
        setQuery("")
        return
      }
      event.currentTarget.blur()
    }
  }

  return (
    <div
      data-slot="search-picker"
      className={cn("flex flex-col gap-1.5", className)}
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
        className="max-h-60 overflow-y-auto border border-input bg-background"
      >
        {filtered.length === 0 ? (
          <li className={listboxEmpty}>{emptyText}</li>
        ) : (
          filtered.map((item, index) => {
            const itemValue = getValue(item)
            const isSelected = itemValue === value
            const isActive = index === highlight
            return (
              <li key={itemValue} role="none">
                <button
                  ref={isActive ? scrollOptionIntoView : undefined}
                  id={listboxOptionId(listId, index)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={disabled}
                  className={cn(
                    "relative flex w-full cursor-default items-center rounded-none py-2 pr-3 pl-3 text-left text-sm outline-hidden select-none",
                    isSelected && optionState.selected,
                    isActive && optionState.active,
                    isActive &&
                      !isSelected &&
                      "bg-accent text-accent-foreground"
                  )}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => selectItem(item)}
                >
                  <span className="truncate">{getLabel(item)}</span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

export { SearchPicker }
