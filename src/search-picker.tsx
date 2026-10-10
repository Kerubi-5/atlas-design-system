"use client"

import * as React from "react"

import { Input } from "./input.js"
import { Label } from "./label.js"
import { cn } from "./utils.js"

const LISTBOX_PAGE_SIZE = 10

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

  const filtered = React.useMemo(
    () => items.filter((item) => filter(item, query, getLabel)),
    [items, filter, query, getLabel]
  )

  const selectedIndex = React.useMemo(() => {
    const index = filtered.findIndex((item) => getValue(item) === value)
    return index >= 0 ? index : 0
  }, [filtered, getValue, value])

  const [highlight, setHighlight] = React.useState(selectedIndex)

  React.useEffect(() => {
    setHighlight(query ? 0 : selectedIndex)
  }, [query, selectedIndex])

  const optionId = (index: number) => `${listId}-option-${index}`
  const active = filtered[highlight]

  const scrollHighlightedOption = React.useCallback(
    (node: HTMLButtonElement | null) => {
      node?.scrollIntoView({ block: "nearest" })
    },
    []
  )

  const selectItem = (item: T) => {
    onSelect(item)
    setQuery("")
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlight((index) =>
        filtered.length === 0 ? 0 : Math.min(index + 1, filtered.length - 1)
      )
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlight((index) => Math.max(index - 1, 0))
    }
    if (event.key === "Home") {
      event.preventDefault()
      setHighlight(0)
    }
    if (event.key === "End") {
      event.preventDefault()
      setHighlight(filtered.length === 0 ? 0 : filtered.length - 1)
    }
    if (event.key === "PageDown") {
      event.preventDefault()
      setHighlight((index) =>
        filtered.length === 0
          ? 0
          : Math.min(index + LISTBOX_PAGE_SIZE, filtered.length - 1)
      )
    }
    if (event.key === "PageUp") {
      event.preventDefault()
      setHighlight((index) => Math.max(index - LISTBOX_PAGE_SIZE, 0))
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
        aria-activedescendant={active ? optionId(highlight) : undefined}
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
          <li className="px-3 py-4 text-center text-sm text-muted-foreground">
            {emptyText}
          </li>
        ) : (
          filtered.map((item, index) => {
            const itemValue = getValue(item)
            const isSelected = itemValue === value
            const isActive = index === highlight
            return (
              <li key={itemValue} role="none">
                <button
                  ref={isActive ? scrollHighlightedOption : undefined}
                  id={optionId(index)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={disabled}
                  className={cn(
                    "relative flex w-full cursor-default items-center rounded-none py-2 pr-3 pl-3 text-left text-sm outline-hidden select-none",
                    isSelected && "bg-selected text-selected-foreground",
                    isActive && "shadow-[inset_2px_0_0_var(--color-ring)]",
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
