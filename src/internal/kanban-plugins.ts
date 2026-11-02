import type { ComponentProps } from "react"
import {
  Accessibility,
  Feedback,
  PointerActivationConstraints,
  PointerSensor,
  type Draggable,
  type PointerSensorOptions,
} from "@dnd-kit/dom"
import { OptimisticSortingPlugin } from "@dnd-kit/dom/sortable"
import type { DragDropProvider } from "@dnd-kit/react"

type PluginsProp = NonNullable<
  ComponentProps<typeof DragDropProvider>["plugins"]
>

/**
 * Board plugins. AutoScroller stays (edge scroll while dragging). Feedback
 * stays because it positions and sizes `DragOverlay`; `feedback: "none"`
 * would leave the overlay behind. The drop animation is off so it does not
 * snap twice against an optimistic update. Accessibility goes: it marks every
 * card a focusable button around its own buttons (axe nested-interactive),
 * and pointer drags need no ARIA; keyboard users move cards from the actions
 * menu.
 */
export const configureKanbanPlugins: Extract<
  PluginsProp,
  (...args: never[]) => unknown
> = (defaults) =>
  defaults
    .filter((plugin) => plugin !== Accessibility)
    .map((plugin) =>
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

/** Skip the actions menu; the body may be a button and still starts a drag. */
function preventCardSensorActivation(event: PointerEvent) {
  return !!(event.target as Element).closest(
    '[data-slot="kanban-card-actions"]'
  )
}

/**
 * Mouse and pen start on pointerdown so a single-step drop (Playwright
 * `dragTo`) has time to render collisions, matching the old handle. Touch
 * waits 250ms so a finger can still scroll the column.
 */
function cardSensorActivationConstraints(event: PointerEvent) {
  if (event.pointerType === "touch") {
    return [
      new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 }),
    ]
  }
  return
}

const cardSensorOptions: PointerSensorOptions = {
  preventActivation: preventCardSensorActivation,
  activationConstraints: cardSensorActivationConstraints,
}

/**
 * A press with no move is a click, not a drop. Cancel that drag before
 * dnd-kit suppresses the click or runs AutoScroller.
 */
class CardPointerSensor extends PointerSensor {
  protected handleStart(source: Draggable, event: PointerEvent) {
    const root = (event.target as Node | null)?.ownerDocument
    const onUp = (up: Event) => {
      const pointer = up as PointerEvent
      root?.removeEventListener("pointerup", onUp, true)
      const start = this.initialCoordinates
      const distance = start
        ? Math.hypot(pointer.clientX - start.x, pointer.clientY - start.y)
        : 0
      if (!Number.isFinite(distance) || distance < 5) {
        pointer.stopImmediatePropagation()
        this.manager.actions.stop({ event: pointer, canceled: true })
        this.cleanup()
      }
    }
    root?.addEventListener("pointerup", onUp, true)
    super.handleStart(source, event)
  }
}

/**
 * Whole-card pointer sensors. Clicks still reach the body; only the actions
 * menu is excluded. Keyboard users move cards from that menu.
 */
export const cardSensors: {
  plugin: typeof CardPointerSensor
  options: PointerSensorOptions
}[] = [{ plugin: CardPointerSensor, options: cardSensorOptions }]
