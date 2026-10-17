/** Column id → ordered card ids, derived from the consumer's `items`. */
export type KanbanGroups = Record<string, string[]>

/** Drop zone ids for the drag-time action rail. */
export const KANBAN_COMPLETE_ID = "__kanban_complete__"
export const KANBAN_DELETE_ID = "__kanban_delete__"

export function buildKanbanGroups<T extends { id: string }>(
  columns: { id: string }[],
  items: T[],
  getColumnId: (item: T) => string
): KanbanGroups {
  const groups: KanbanGroups = {}
  for (const column of columns) groups[column.id] = []
  for (const item of items) {
    const columnId = getColumnId(item)
    const group = groups[columnId]
    if (!group) {
      console.warn(
        `[KanbanBoard] item "${item.id}" maps to unknown column "${columnId}" and is not rendered`
      )
      continue
    }
    group.push(item.id)
  }
  return groups
}

/** What dnd-kit reports at drag end, reduced to plain ids. */
export type KanbanDropInput = {
  itemId: string
  /** Droppable under the pointer: a column, a card, or a rail zone. */
  targetId: string | null
  /** The target card's column, when the target is a card. */
  targetGroup: string | null
  /** Column the card started in. */
  initialGroup: string | null
  /** Column the card is over now. */
  currentGroup: string | null
  /** Sortable index in the target column. */
  index: number | undefined
}

export type KanbanDrop =
  | { kind: "complete"; itemId: string }
  | { kind: "delete"; itemId: string }
  | {
      kind: "move"
      itemId: string
      toColumnId: string
      beforeId: string | null
      afterId: string | null
    }

function targetColumn(input: KanbanDropInput, groups: KanbanGroups) {
  const { targetId, targetGroup, currentGroup } = input
  if (targetId != null) {
    if (targetId in groups) return targetId
    if (targetGroup != null) return targetGroup
    for (const [columnId, ids] of Object.entries(groups)) {
      if (ids.includes(targetId)) return columnId
    }
  }
  return currentGroup
}

/**
 * Turn a drop into a complete, delete, or move with the neighbours at the
 * insertion slot. `null` when the drop changes nothing.
 */
export function resolveKanbanDrop(
  input: KanbanDropInput,
  groups: KanbanGroups
): KanbanDrop | null {
  const { itemId, targetId, initialGroup, index: rawIndex } = input
  if (targetId === KANBAN_COMPLETE_ID) return { kind: "complete", itemId }
  if (targetId === KANBAN_DELETE_ID) return { kind: "delete", itemId }

  const toColumnId = targetColumn(input, groups)
  if (!initialGroup || !toColumnId) return null

  const columnItems = groups[toColumnId] ?? []
  const remaining = columnItems.filter((id) => id !== itemId)
  const index = Math.max(
    0,
    Math.min(rawIndex ?? remaining.length, remaining.length)
  )
  if (initialGroup === toColumnId && index === columnItems.indexOf(itemId)) {
    return null
  }

  return {
    kind: "move",
    itemId,
    toColumnId,
    beforeId: index > 0 ? (remaining[index - 1] ?? null) : null,
    afterId: remaining[index] ?? null,
  }
}

/** Pixel slop so sub-pixel scrollWidth vs clientWidth does not flicker cues. */
const OVERFLOW_EDGE_PX = 8

export type KanbanOverflowEdges = { start: boolean; end: boolean }

/** Whether a horizontal scroller has more content past either edge. */
export function kanbanOverflowEdges(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number
): KanbanOverflowEdges {
  const maxScroll = Math.max(0, scrollWidth - clientWidth)
  return {
    start: scrollLeft > OVERFLOW_EDGE_PX,
    end: scrollLeft < maxScroll - OVERFLOW_EDGE_PX,
  }
}

/** One "page" of columns: most of the viewport, at least one narrow column. */
export function kanbanScrollStepPx(clientWidth: number): number {
  return Math.max(140, Math.round(clientWidth * 0.75))
}

/** Smooth-scroll toward the start (`-1`) or end (`1`); no-op without a scroller. */
export function kanbanScrollBy(
  scroller: {
    clientWidth: number
    scrollBy: (options: ScrollToOptions) => void
  } | null,
  direction: -1 | 1
): void {
  scroller?.scrollBy({
    left: direction * kanbanScrollStepPx(scroller.clientWidth),
    behavior: "smooth",
  })
}
