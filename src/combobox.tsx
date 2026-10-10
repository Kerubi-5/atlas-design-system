"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "./button.js"
import { Input } from "./input.js"
import { formControlTriggerClassName } from "./internal/form-control.js"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js"
import { cn, onInputChange } from "./utils.js"

export type ComboboxOption = {
  value: string
  label: string
}

type ComboboxProps = {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  id?: string
  className?: string
  "aria-invalid"?: boolean
}

/**
 * PageUp/PageDown jump size. The option list is `max-h-60`; ten rows is a
 * bit more than one viewport so long lists (timezones, currencies) move
 * without requiring an End key.
 */
const LISTBOX_PAGE_SIZE = 10

/**
 * Searchable single-select built from Button, Popover, and Input.
 * The trigger uses the same form-control chrome as Input and SelectTrigger.
 * Options are a plain `{ value, label }` list; domain data stays in the app.
 * Keyboard highlight (arrows, Home/End, PageUp/PageDown) scrolls the active
 * option into view inside the overflow list.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select",
  searchPlaceholder = "Search",
  emptyText = "No results",
  disabled,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlight, setHighlight] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listId = React.useId()
  const selected = options.find((option) => option.value === value)
  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(needle)
    )
  }, [options, query])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery("")
      return
    }
    // Set the highlight in the same turn as open so the first painted list
    // already points at the selected option (a timezone at the end of 400
    // rows) instead of flashing index 0 and scrolling twice.
    const selectedIndex = options.findIndex((option) => option.value === value)
    setHighlight(selectedIndex >= 0 ? selectedIndex : 0)
  }

  React.useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  // Callback ref (not an effect) so scroll runs when Radix mounts the list
  // and when the highlight moves. A layout effect on `open` is too early:
  // the option node does not exist until the popover content is in the DOM.
  const scrollHighlightedOption = React.useCallback(
    (node: HTMLButtonElement | null) => {
      node?.scrollIntoView({ block: "nearest" })
    },
    []
  )

  const onQueryChange = onInputChange((next) => {
    setQuery(next)
    setHighlight(0)
  })

  // Closing from here does not go through Radix's onOpenChange, so clear the
  // query too. A stale query would filter the next open while the highlight
  // is computed against the full list, and Enter would pick the wrong option.
  const selectValue = (next: string) => {
    onValueChange(next)
    setOpen(false)
    setQuery("")
  }

  // Index-based ids: option values may contain spaces, which are not valid
  // in an id or an aria-activedescendant reference.
  const optionId = (index: number) => `${listId}-option-${index}`

  const activeOption = filtered[highlight]

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    if (event.key === "Enter") {
      event.preventDefault()
      const option = filtered[highlight]
      if (option) selectValue(option.value)
    }
    // Home/End/Page jump the highlight; preventDefault so the search caret
    // stays put and the page behind the list does not scroll.
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
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            formControlTriggerClassName,
            "justify-between",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDownIcon data-icon="inline-end" className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] gap-0 rounded-none p-0"
      >
        <div className="border-b p-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={onQueryChange}
            onKeyDown={onSearchKeyDown}
            placeholder={searchPlaceholder}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={
              activeOption ? optionId(highlight) : undefined
            }
          />
        </div>
        <ul id={listId} role="listbox" className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground">
              {emptyText}
            </li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.value === value
              const isActive = index === highlight
              return (
                <li key={option.value} role="none">
                  <button
                    ref={isActive ? scrollHighlightedOption : undefined}
                    id={optionId(index)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "relative flex w-full cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-3 text-left text-sm outline-hidden select-none",
                      isSelected && "bg-selected text-selected-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => selectValue(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <CheckIcon className="pointer-events-none absolute right-2 size-3.5" />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
