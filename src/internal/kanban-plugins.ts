import type { ComponentProps } from "react"
import { Feedback } from "@dnd-kit/dom"
import { OptimisticSortingPlugin } from "@dnd-kit/dom/sortable"
import type { DragDropProvider } from "@dnd-kit/react"

type PluginsProp = NonNullable<
  ComponentProps<typeof DragDropProvider>["plugins"]
>

/**
 * Board plugins. AutoScroller stays (edge scroll while dragging). Feedback
 * stays because it positions and sizes `DragOverlay`; `feedback: "none"`
 * would leave the overlay behind. The drop animation is off so it does not
 * snap twice against an optimistic update.
 */
export const configureKanbanPlugins: Extract<
  PluginsProp,
  (...args: never[]) => unknown
> = (defaults) =>
  defaults.map((plugin) =>
    plugin === Feedback ? Feedback.configure({ dropAnimation: null }) : plugin
  )

/**
 * Cards leave out OptimisticSortingPlugin: it moves DOM nodes under React and
 * throws `removeChild` on re-render (dnd-kit #1747). Column layout comes from
 * the consumer's `items`.
 */
export function configureCardSortablePlugins<T>(defaults: readonly T[]): T[] {
  return defaults.filter((plugin) => plugin !== OptimisticSortingPlugin)
}
