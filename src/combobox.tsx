"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "./button.js"
import { Input } from "./input.js"
import { formControlTriggerClassName } from "./internal/form-control.js"
import {
  foldSearchText,
  handleListboxKey,
  listboxOptionId,
} from "./internal/listbox-navigation.js"
import { ListboxEmptyStatus, ListboxOption } from "./internal/listbox-option.js"
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
  /** Classes for the trigger, e.g. its width; the list matches it. */
  className?: string
  /** Classes for the listbox, e.g. its height. Defaults to `max-h-60`. */
  listClassName?: string
  /**
   * Classes for the popover panel, e.g. a width other than the trigger's.
   * Defaults to the trigger width.
   */
  contentClassName?: string
  "aria-invalid"?: boolean
  /** Name the trigger when there is no `<Label htmlFor={id}>`. */
  "aria-label"?: string
  "aria-labelledby"?: string
  /**
   * Offer creating the current query when it is not already an option.
   * Off by default so existing callers stay search-and-select.
   */
  creatable?: boolean
  /**
   * Turn the search query into a value to create, or `null` to hide the
   * create action. Default trims the query. Apps own domain rules (for
   * example `^[A-Z]{3}$` for currency codes); catalogs stay in the app.
   */
  normalizeCreateValue?: (query: string) => string | null
  /**
   * Visible and accessible name for the create option. Default is
   * `Create "{value}"`.
   */
  createLabel?: (value: string) => string
} & Omit<
  React.ComponentProps<"button">,
  // Owned by the combobox: its value, its open state, and its ARIA wiring.
  | "value"
  | "defaultValue"
  | "children"
  | "type"
  | "role"
  | "aria-expanded"
  | "aria-controls"
  | "onKeyDown"
>

const CREATE_OPTION_KEY = "__atlas-combobox-create"

/**
 * Trimmed query, or `null` when there is nothing to create.
 */
function defaultNormalizeCreateValue(query: string) {
  const next = query.trim()
  return next.length > 0 ? next : null
}

/**
 * Accessible create action: the word "Create" plus the quoted value.
 */
function defaultCreateLabel(value: string) {
  return `Create "${value}"`
}

/**
 * Value to offer as a new option, or `null` when the query is empty,
 * rejected by `normalize`, or already in the list (value or label,
 * ignoring case and accents). Domain catalogs stay with the caller.
 */
function resolveCreateValue(
  query: string,
  options: ComboboxOption[],
  normalize: (query: string) => string | null
) {
  const created = normalize(query)
  if (created == null) return null
  const value = created.trim()
  if (!value) return null
  const needle = foldSearchText(value)
  const exists = options.some(
    (option) =>
      foldSearchText(option.value) === needle ||
      foldSearchText(option.label) === needle
  )
  return exists ? null : value
}

/**
 * Searchable single-select built from Button, Popover, and Input.
 * The trigger uses the same form-control chrome as Input and SelectTrigger.
 * Options are a plain `{ value, label }` list; domain data stays in the app.
 * Keyboard highlight (arrows, Home/End, PageUp/PageDown) scrolls the active
 * option into view inside the overflow list.
 * Opt-in `creatable` appends a create action when the query is not already
 * an option; choosing it calls `onValueChange` like a normal selection.
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
  listClassName,
  contentClassName,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  creatable = false,
  normalizeCreateValue = defaultNormalizeCreateValue,
  createLabel = defaultCreateLabel,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlight, setHighlight] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listId = React.useId()
  const generatedId = React.useId()
  const triggerId = id ?? generatedId
  // A created value may not be in `options` yet (the app owns the catalog).
  // Keep it visible on the trigger and in the list so reopen/Enter still work.
  const resolvedOptions = React.useMemo(() => {
    if (!creatable || !value) return options
    if (options.some((option) => option.value === value)) return options
    return [...options, { value, label: value }]
  }, [creatable, options, value])
  const selected = resolvedOptions.find((option) => option.value === value)
  const filtered = React.useMemo(() => {
    const needle = foldSearchText(query.trim())
    if (!needle) return resolvedOptions
    return resolvedOptions.filter((option) =>
      foldSearchText(option.label).includes(needle)
    )
  }, [resolvedOptions, query])
  const createValue = creatable
    ? resolveCreateValue(query, resolvedOptions, normalizeCreateValue)
    : null
  const createOption = createValue
    ? { value: createValue, label: createLabel(createValue) }
    : null
  const list = createOption ? [...filtered, createOption] : filtered

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery("")
      return
    }
    // Set the highlight in the same turn as open so the first painted list
    // already points at the selected option (a timezone at the end of 400
    // rows) instead of flashing index 0 and scrolling twice.
    const selectedIndex = resolvedOptions.findIndex(
      (option) => option.value === value
    )
    setHighlight(selectedIndex >= 0 ? selectedIndex : 0)
  }

  React.useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

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

  const activeOption = list[highlight]
  const empty = list.length === 0

  // APG combobox: ArrowDown, ArrowUp, and Alt+ArrowDown open the list from
  // the trigger. Radix only opens a popover on Enter, Space, and click.
  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (open || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return
    event.preventDefault()
    onOpenChange(true)
  }

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    handleListboxKey(event, {
      highlight,
      length: list.length,
      setHighlight,
      onEnter: (index) => {
        const option = list[index]
        if (option) selectValue(option.value)
      },
    })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          {...props}
          id={triggerId}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          disabled={disabled}
          onKeyDown={onTriggerKeyDown}
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
        className={cn(
          "w-[var(--radix-popover-trigger-width)] gap-0 rounded-none p-0",
          contentClassName
        )}
      >
        <div data-slot="combobox-search" className="border-b p-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={onQueryChange}
            onKeyDown={onSearchKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={
              activeOption ? listboxOptionId(listId, highlight) : undefined
            }
          />
        </div>
        <ul
          id={listId}
          role="listbox"
          data-slot="combobox-list"
          // Same name as the trigger: its own label, or the <Label htmlFor>
          // that names the trigger (read through the trigger's id).
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (ariaLabel ? undefined : triggerId)
          }
          className={
            empty
              ? "sr-only"
              : cn("max-h-60 overflow-y-auto p-1", listClassName)
          }
        >
          {list.map((option, index) => {
            const isCreate = createOption != null && option === createOption
            const isSelected = option.value === value && !isCreate
            return (
              <ListboxOption
                key={isCreate ? CREATE_OPTION_KEY : option.value}
                data-slot="combobox-option"
                listId={listId}
                index={index}
                active={index === highlight}
                selected={isSelected}
                className="pr-8"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => selectValue(option.value)}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <CheckIcon className="pointer-events-none absolute right-2 size-3.5" />
                ) : null}
              </ListboxOption>
            )
          })}
        </ul>
        <ListboxEmptyStatus empty={empty}>{emptyText}</ListboxEmptyStatus>
      </PopoverContent>
    </Popover>
  )
}
