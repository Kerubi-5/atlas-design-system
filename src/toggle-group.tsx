"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "./utils.js"
import { toggleVariants } from "./toggle.js"

/** Layout props a `ToggleGroup` shares with its items. */
type ToggleGroupLayoutProps = {
  /**
   * Gap between items, in spacing units. `0` joins them into one segmented
   * control. Default `2`.
   */
  spacing?: number
  /** Lay items out in a row or a column. Default `horizontal`. */
  orientation?: "horizontal" | "vertical"
}

/** The keys Radix's roving focus moves between items with. */
const arrowKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"])

function isItem(target: EventTarget): target is HTMLElement {
  return (
    target instanceof HTMLElement && target.dataset.slot === "toggle-group-item"
  )
}

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & ToggleGroupLayoutProps
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  onKeyDown,
  onPointerDown,
  onFocus,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> &
  ToggleGroupLayoutProps) {
  // The item an arrow key was pressed on, until focus lands on the next one.
  // A single group's items are radios, and focus that arrives by arrow key
  // selects, as in any radio group; Tab and clicks do not.
  const arrowFrom = React.useRef<EventTarget | null>(null)
  const selectsOnArrow = props.type === "single" && props.rovingFocus !== false
  const context = React.useMemo(
    () => ({ variant, size, spacing, orientation }),
    [variant, size, spacing, orientation]
  )
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        // Radix moves focus to the next item once the key has bubbled up.
        if (
          selectsOnArrow &&
          arrowKeys.has(event.key) &&
          isItem(event.target) &&
          !(event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        ) {
          arrowFrom.current = event.target
        }
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        arrowFrom.current = null
      }}
      onFocus={(event) => {
        onFocus?.(event)
        const from = arrowFrom.current
        arrowFrom.current = null
        const item = event.target
        // Clicking runs the selection Radix already owns, onValueChange included.
        if (
          from &&
          from !== item &&
          isItem(item) &&
          item.getAttribute("aria-checked") !== "true"
        ) {
          item.click()
        }
      }}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit max-w-full flex-row flex-wrap items-center gap-[--spacing(var(--gap))] data-[spacing=0]:data-[variant=outline]:rounded-none data-vertical:flex-col data-vertical:flex-nowrap data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={context}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:shadow-none focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-none group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-none group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
