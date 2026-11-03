import type { ComponentProps } from "react"
import {
  Accessibility,
  Feedback,
  PointerActivationConstraints,
  PointerSensor,
  type DragDropManager,
  type Draggable,
  type Droppable,
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
 * Pixels the mouse or pen must move before a press becomes a drag. A click
 * with no movement (or jitter under this) stays a click so `onCardClick`
 * fires. Playwright `dragTo` still moves far past this before drop.
 */
const CARD_POINTER_DISTANCE = 5

/**
 * Mouse and pen wait for `CARD_POINTER_DISTANCE` so a click still opens the
 * card. 1.3.1 started the drag on pointerdown, which set the source to
 * `pointer-events-none` and swallowed pointerup in capture, so the click
 * never reached the body. Touch waits 250ms so a finger can still scroll
 * the column.
 */
function cardSensorActivationConstraints(event: PointerEvent) {
  if (event.pointerType === "touch") {
    return [
      new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 }),
    ]
  }
  return [
    new PointerActivationConstraints.Distance({
      value: CARD_POINTER_DISTANCE,
    }),
  ]
}

const cardSensorOptions: PointerSensorOptions = {
  preventActivation: preventCardSensorActivation,
  activationConstraints: cardSensorActivationConstraints,
}

/**
 * Droppable under the pointer, skipping the drag overlay. Distance
 * activation starts the drag on the first move past 5px; a single-step
 * Playwright `dragTo` then fires pointerup while that move is still being
 * applied, so dnd-kit's collisions still sit at the press coordinates.
 * `elementsFromPoint` sees the column or card the pointer actually covers.
 */
function droppableIdFromPoint(
  manager: DragDropManager,
  x: number,
  y: number
): string | number | undefined {
  const byElement = new Map<Element, Droppable>()
  for (const droppable of manager.registry.droppables) {
    if (droppable.element) byElement.set(droppable.element, droppable)
  }
  for (const node of document.elementsFromPoint(x, y)) {
    if (node.closest("[data-dnd-overlay]")) continue
    let current: Element | null = node
    while (current) {
      const droppable = byElement.get(current)
      if (droppable && !droppable.disabled) return droppable.id
      current = current.parentElement
    }
  }
}

/**
 * Distance activation starts the drag on the first move past 5px. The
 * default PointerSensor binds pointerup on the document in capture, and
 * that listener would stop the drag at the press coordinates. Listen on
 * window in capture so we run first, drop on whatever is under the
 * pointer, then stop.
 */
class CardPointerSensor extends PointerSensor {
  private unbindDrop: (() => void) | undefined

  protected handleStart(source: Draggable, event: PointerEvent) {
    super.handleStart(source, event)
    if (this.manager.dragOperation.status.idle) return

    const view =
      event.view ?? (event.target as Node | null)?.ownerDocument?.defaultView
    if (!view) return

    const pointerId = event.pointerId
    const onUp = (up: Event) => {
      const pointer = up as PointerEvent
      if (pointer.pointerId !== pointerId) return
      this.unbindDrop?.()
      this.unbindDrop = undefined
      if (this.manager.dragOperation.status.idle) return
      pointer.preventDefault()
      pointer.stopImmediatePropagation()
      const id = droppableIdFromPoint(
        this.manager,
        pointer.clientX,
        pointer.clientY
      )
      if (id != null) void this.manager.actions.setDropTarget(id)
      this.manager.actions.stop({ event: pointer, canceled: false })
      this.cleanup()
    }
    this.unbindDrop = () => {
      view.removeEventListener("pointerup", onUp, true)
    }
    view.addEventListener("pointerup", onUp, true)
  }

  protected cleanup() {
    this.unbindDrop?.()
    this.unbindDrop = undefined
    super.cleanup()
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
