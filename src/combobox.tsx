"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "./button.js"
import { Input } from "./input.js"
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
 * Searchable single-select built from Button, Popover, and Input.
 * Options are a plain `{ value, label }` list; domain data stays in the app.
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

  // Highlight and search reset when the popover opens or closes; options/value
  // are read for the initial highlight rather than subscribed as deps.
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }
    const selectedIndex = options.findIndex((option) => option.value === value)
    setHighlight(selectedIndex >= 0 ? selectedIndex : 0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const onQueryChange = onInputChange((next) => {
    setQuery(next)
    setHighlight(0)
  })

  const selectValue = (next: string) => {
    onValueChange(next)
    setOpen(false)
  }

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
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            "h-10 w-full justify-between font-normal tracking-normal normal-case",
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
              activeOption
                ? `${listId}-option-${activeOption.value}`
                : undefined
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
                    id={`${listId}-option-${option.value}`}
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
