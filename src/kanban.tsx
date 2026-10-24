"use client"

import * as React from "react"
import {
  DragDropProvider,
  DragOverlay,
  useDragOperation,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react"
import { isSortable, useSortable } from "@dnd-kit/react/sortable"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import { Button } from "./button.js"
import {
  KANBAN_COMPLETE_ID,
  KANBAN_DELETE_ID,
  buildKanbanGroups,
  kanbanOverflowEdges,
  kanbanScrollBy,
  resolveKanbanDrop,
  type KanbanOverflowEdges,
} from "./internal/kanban-layout.js"
import {
  configureCardSortablePlugins,
  configureKanbanPlugins,
} from "./internal/kanban-plugins.js"
import { focusRing } from "./internal/styles.js"
import { revealInline } from "./internal/use-horizontal-overflow.js"
import { Skeleton } from "./skeleton.js"
import { cn } from "./utils.js"

/**
 * One board column. Columns render in the order given. `color` (any CSS
 * color) draws a status dot; `badge` is trailing header meta such as a total.
 */
export type KanbanColumn = {
  /** Matches what `getColumnId` returns for the column's cards. */
  id: string
  /** Header text. */
  label: string
  /** Any CSS color; draws a status dot before the label. No dot when omitted. */
  color?: string
  /** Trailing header meta under the card count, such as a total. */
  badge?: React.ReactNode
  /** Replaces the board's `emptyLabel` for this column. */
  emptyLabel?: string
}

/**
 * Positions of the cards on either side of the drop slot (`undefined` at a
 * column edge). Feed them to a fractional-index helper to store the order.
 */
export type KanbanDropTarget = {
  /** `position` of the card above the drop slot; `undefined` at the top. */
  beforePosition: number | undefined
  /** `position` of the card below the drop slot; `undefined` at the bottom. */
  afterPosition: number | undefined
}

export type KanbanBoardProps<T extends { id: string; position: number }> = {
  /** The board's columns, in display order. */
  columns: KanbanColumn[]
  /** Every card, in display order; sort by `position` first. A card whose column id is unknown is not shown. */
  items: T[]
  /** The id of the column a card belongs in. */
  getColumnId: (item: T) => string
  /** Every drop that changes a column or the order, including same-column reorders. */
  onMove: (item: T, toColumnId: string, target: KanbanDropTarget) => void
  /** Shows a Finish zone while dragging. */
  onComplete?: (itemId: string) => void
  /** Shows a Remove zone while dragging. */
  onDelete?: (itemId: string) => void
  /**
   * Card body; the board adds the grip, chrome, and sorting. Cards re-render
   * only when their item changes while this and `onCardClick` keep their
   * identity, so define them outside the render or wrap them in `useCallback`.
   */
  renderCard: (item: T) => React.ReactNode
  /** Makes the card body a button. */
  onCardClick?: (item: T) => void
  /** Skeleton cards on a first load with no items; dims the board on a refetch. */
  isLoading?: boolean
  /** Text in a column with no cards. Default `"Drop here"`. */
  emptyLabel?: string
  /** Text on the Finish zone. Default `"Finish"`. */
  completeLabel?: string
  /** Text on the Remove zone. Default `"Remove"`. */
  deleteLabel?: string
  /** Classes for the horizontal scroller that holds the columns. */
  scrollerClassName?: string
  /** Classes for every column, e.g. to pin a width instead of growing. */
  columnClassName?: string
  /** Classes for every card, including the one under the pointer while dragging. */
  cardClassName?: string
} & Omit<React.ComponentProps<"div">, "children">

/** Column droppables lose to cards, so a drop lands between cards. */
const COLUMN_DROP_PRIORITY = 1
/** Rail zones beat columns when both are under the pointer. */
const ACTION_ZONE_PRIORITY = 10

/** Grow to fill the board; 18rem floor so a long row still scrolls. */
const columnSize = "flex-1 basis-72 min-w-72 min-h-[min(70vh,32rem)]"

/**
 * Drag-and-drop board built on dnd-kit. The consumer owns `items` and maps
 * each to a column; the board derives its layout from them, so an optimistic
 * cache update is the only state. Cards drag by their grip, the body stays
 * clickable, and off-screen columns get edge fades and scroll buttons.
 */
function KanbanBoard<T extends { id: string; position: number }>({
  columns,
  items,
  getColumnId,
  onMove,
  onComplete,
  onDelete,
  renderCard,
  onCardClick,
  isLoading = false,
  emptyLabel = "Drop here",
  completeLabel = "Finish",
  deleteLabel = "Remove",
  className,
  scrollerClassName,
  columnClassName,
  cardClassName,
  ...props
}: KanbanBoardProps<T>) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const overflow = useOverflowEdges(scrollerRef, columns.length, items.length)

  const itemById = React.useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items]
  )
  const groups = React.useMemo(
    () => buildKanbanGroups(columns, items, getColumnId),
    [columns, items, getColumnId]
  )

  const showSkeletons = isLoading && items.length === 0
  const dimmed = isLoading && !showSkeletons

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    // Layout comes from `items`; stop dnd-kit moving cards between groups.
    event.preventDefault()
  }, [])

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const { source, target } = event.operation
      if (!source || !isSortable(source)) return
      const drop = resolveKanbanDrop(
        {
          itemId: String(source.id),
          targetId: target ? String(target.id) : null,
          targetGroup:
            target && isSortable(target) && target.group != null
              ? String(target.group)
              : null,
          initialGroup:
            source.initialGroup != null ? String(source.initialGroup) : null,
          currentGroup: source.group != null ? String(source.group) : null,
          index: typeof source.index === "number" ? source.index : undefined,
        },
        groups
      )
      if (!drop) return
      if (drop.kind === "complete") return onComplete?.(drop.itemId)
      if (drop.kind === "delete") return onDelete?.(drop.itemId)
      const item = itemById.get(drop.itemId)
      if (!item) return
      onMove(item, drop.toColumnId, {
        beforePosition: drop.beforeId
          ? itemById.get(drop.beforeId)?.position
          : undefined,
        afterPosition: drop.afterId
          ? itemById.get(drop.afterId)?.position
          : undefined,
      })
    },
    [groups, itemById, onComplete, onDelete, onMove]
  )

  const scrollToStart = React.useCallback(
    () => kanbanScrollBy(scrollerRef.current, -1),
    []
  )
  const scrollToEnd = React.useCallback(
    () => kanbanScrollBy(scrollerRef.current, 1),
    []
  )

  const renderOverlay = React.useCallback(
    (source: { id: string | number } | null) => {
      const item = source ? itemById.get(String(source.id)) : undefined
      if (!item) return null
      return (
        <div
          data-slot="kanban-drag-overlay"
          className={cn(
            cardChrome,
            "shadow-lg ring-2 ring-ring/30",
            cardClassName
          )}
        >
          <div className={cn(handleChrome, "cursor-grabbing")}>
            <GripVertical className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 p-3">{renderCard(item)}</div>
        </div>
      )
    },
    [cardClassName, itemById, renderCard]
  )

  // `min-w-0` lets a flex or grid parent shrink the board so the scroller,
  // not the page, overflows.
  return (
    <div
      data-slot="kanban-board"
      className={cn("min-w-0", className)}
      {...props}
    >
      <DragDropProvider
        plugins={configureKanbanPlugins}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="relative min-w-0">
          <div
            ref={scrollerRef}
            data-slot="kanban-scroller"
            data-loading={dimmed || undefined}
            data-overflow-start={overflow.start || undefined}
            data-overflow-end={overflow.end || undefined}
            onScroll={overflow.measure}
            onFocus={(event) => {
              const card = event.target.closest('[data-slot="kanban-card"]')
              if (card) revealInline(event.currentTarget, card)
            }}
            className={cn(
              "flex min-w-0 gap-4 overflow-x-auto pb-2",
              // AutoScroller scrolls in small steps near the edge; mandatory
              // snap would pull each one back, so it is off mid-drag.
              "snap-x snap-mandatory scroll-px-2 has-data-dragging:snap-none",
              "data-loading:opacity-60",
              scrollerClassName
            )}
          >
            {columns.map((column) => {
              const ids = groups[column.id] ?? []
              return (
                <KanbanColumnView
                  key={column.id}
                  column={column}
                  count={showSkeletons ? 0 : ids.length}
                  emptyLabel={column.emptyLabel ?? emptyLabel}
                  loading={showSkeletons}
                  className={columnClassName}
                >
                  {ids.map((id, index) => {
                    const item = itemById.get(id)
                    if (!item) return null
                    return (
                      <KanbanCardView
                        key={id}
                        item={item}
                        index={index}
                        column={column.id}
                        onCardClick={onCardClick}
                        className={cardClassName}
                        renderCard={renderCard}
                      />
                    )
                  })}
                </KanbanColumnView>
              )
            })}
          </div>
          <OverflowFade side="start" visible={overflow.start} />
          <OverflowFade side="end" visible={overflow.end} />
          {overflow.start ? (
            <ScrollButton side="start" onClick={scrollToStart} />
          ) : null}
          {overflow.end ? (
            <ScrollButton side="end" onClick={scrollToEnd} />
          ) : null}
          {overflow.start || overflow.end ? (
            <p className="sr-only">
              More columns available. Scroll horizontally to see them.
            </p>
          ) : null}
        </div>
        {onComplete || onDelete ? (
          <ActionRail
            completeLabel={onComplete ? completeLabel : null}
            deleteLabel={onDelete ? deleteLabel : null}
          />
        ) : null}
        <DragOverlay dropAnimation={null}>{renderOverlay}</DragOverlay>
      </DragDropProvider>
    </div>
  )
}

function useOverflowEdges(
  ref: React.RefObject<HTMLDivElement | null>,
  columnCount: number,
  itemCount: number
) {
  const [edges, setEdges] = React.useState<KanbanOverflowEdges>({
    start: false,
    end: false,
  })

  const measure = React.useCallback(() => {
    const element = ref.current
    if (!element) return
    const next = kanbanOverflowEdges(
      element.scrollLeft,
      element.clientWidth,
      element.scrollWidth
    )
    // Scroll fires every frame; keep the old object so the board (and every
    // card in it) re-renders only when an edge appears or goes.
    setEdges((edges) =>
      edges.start === next.start && edges.end === next.end ? edges : next
    )
  }, [ref])

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === "undefined") return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    return () => observer.disconnect()
  }, [columnCount, itemCount, measure, ref])

  return { ...edges, measure }
}

function KanbanColumnView({
  column,
  count,
  emptyLabel,
  loading,
  className,
  children,
}: {
  column: KanbanColumn
  count: number
  emptyLabel: string
  loading: boolean
  className?: string
  children: React.ReactNode
}) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: "column",
    accept: "item",
    collisionPriority: COLUMN_DROP_PRIORITY,
  })
  const empty = count === 0

  return (
    <div
      ref={ref}
      data-slot="kanban-column"
      data-drop-target={isDropTarget || undefined}
      className={cn(
        "flex snap-start flex-col gap-3 p-3",
        "bg-muted/40 ring-1 ring-foreground/5",
        "data-drop-target:bg-muted/60 data-drop-target:ring-2 data-drop-target:ring-ring/60",
        columnSize,
        className
      )}
    >
      {/* The name truncates; the count and badge wrap under it, to the
          right, once they no longer fit beside it. */}
      <div
        data-slot="kanban-column-header"
        className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5"
      >
        <span className="flex max-w-full min-w-0 items-center gap-2 text-xs font-semibold tracking-widest uppercase">
          {column.color ? (
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          ) : null}
          <span className="truncate leading-tight" title={column.label}>
            {column.label}
          </span>
        </span>
        <span className="ml-auto flex max-w-full min-w-0 flex-col items-end gap-0.5 text-muted-foreground tabular-nums">
          <span className="text-xs">{count}</span>
          {column.badge ? (
            <span className="max-w-full truncate text-[10px] font-medium">
              {column.badge}
            </span>
          ) : null}
        </span>
      </div>
      {/* `p-1` gives the focused stop's 4px ring (2px ring + 2px gap) room
          inside the scroll area, which clips at its padding edge. `-m-1`
          pulls the top, bottom and left back out so the cards stay where
          they were; the right keeps its 4px gutter. */}
      <div className="-m-1 mr-0 flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto p-1">
        {loading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-16" />
          </>
        ) : (
          <>
            {children}
            <p
              data-slot="kanban-column-empty"
              aria-hidden={!empty}
              className={cn(
                "border border-dashed px-3 py-6 text-center text-xs text-muted-foreground",
                !empty && "hidden"
              )}
            >
              {emptyLabel}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const cardChrome = cn("flex border border-border bg-card text-card-foreground")

const handleChrome = cn(
  "flex shrink-0 items-center self-stretch border-r border-border",
  "bg-muted/30 px-1.5 text-muted-foreground"
)

const stopFocus = cn(focusRing, "relative focus-visible:z-10")

function stopClick(event: React.MouseEvent) {
  event.stopPropagation()
}

function KanbanCardViewImpl<T extends { id: string }>({
  item,
  index,
  column,
  onCardClick,
  className,
  renderCard,
}: {
  item: T
  index: number
  column: string
  onCardClick?: (item: T) => void
  className?: string
  renderCard: (item: T) => React.ReactNode
}) {
  const children = renderCard(item)
  const { handleRef, ref, isDragging } = useSortable({
    id: item.id,
    index,
    type: "item",
    accept: "item",
    group: column,
    transition: null,
    plugins: configureCardSortablePlugins,
  })

  return (
    <div
      ref={ref}
      data-slot="kanban-card"
      data-dragging={isDragging || undefined}
      className={cn(
        cardChrome,
        "shadow-sm transition-[box-shadow,opacity,border-color]",
        // The overlay moves; the source keeps its slot.
        "data-dragging:pointer-events-none data-dragging:invisible",
        onCardClick && "hover:border-foreground/15",
        className
      )}
    >
      {/* Each stop draws its own ring; z-10 keeps the sibling from covering it. */}
      <button
        type="button"
        ref={handleRef}
        data-slot="kanban-card-handle"
        aria-label="Drag to move"
        onClick={stopClick}
        className={cn(
          handleChrome,
          stopFocus,
          "cursor-grab hover:bg-muted/50 active:cursor-grabbing"
        )}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      {onCardClick ? (
        <button
          type="button"
          data-slot="kanban-card-body"
          onClick={() => onCardClick(item)}
          className={cn(
            "min-w-0 flex-1 cursor-pointer p-3 text-left hover:bg-muted/20",
            stopFocus
          )}
        >
          {children}
        </button>
      ) : (
        <div data-slot="kanban-card-body" className="min-w-0 flex-1 p-3">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Memoized so a board update re-renders only the cards whose item, index or
 * column changed, when `renderCard` and the other props keep their identity.
 */
const KanbanCardView = React.memo(
  KanbanCardViewImpl
) as typeof KanbanCardViewImpl

/**
 * Finish / Remove zones under the board while a card drags. Not sticky: a
 * sticky rail overlapping tall columns stole their drops.
 */
function ActionRail({
  completeLabel,
  deleteLabel,
}: {
  completeLabel: string | null
  deleteLabel: string | null
}) {
  const dragging = useDragOperation().source != null
  return (
    <div
      data-slot="kanban-action-rail"
      aria-hidden={!dragging}
      className={cn(
        "relative z-20 -mx-1 mt-3 flex flex-col gap-2 bg-background px-1 pb-1 sm:flex-row",
        !dragging && "pointer-events-none"
      )}
    >
      {completeLabel != null ? (
        <ActionZone
          id={KANBAN_COMPLETE_ID}
          label={completeLabel}
          regionLabel="Drop here to finish"
          icon={CheckCircle2}
          tone="success"
          visible={dragging}
        />
      ) : null}
      {deleteLabel != null ? (
        <ActionZone
          id={KANBAN_DELETE_ID}
          label={deleteLabel}
          regionLabel="Drop here to remove"
          icon={Trash2}
          tone="destructive"
          visible={dragging}
        />
      ) : null}
    </div>
  )
}

const zoneTone = {
  success: {
    idle: "border-success/60 bg-success/10 text-success",
    active: "border-success bg-success/25 text-success ring-2 ring-success/40",
  },
  destructive: {
    idle: "border-destructive/60 bg-destructive/10 text-destructive",
    active:
      "border-destructive bg-destructive/25 text-destructive ring-2 ring-destructive/40",
  },
} as const

function ActionZone({
  id,
  label,
  regionLabel,
  icon: Icon,
  tone,
  visible,
}: {
  id: string
  label: string
  regionLabel: string
  icon: LucideIcon
  tone: keyof typeof zoneTone
  visible: boolean
}) {
  const { ref, isDropTarget } = useDroppable({
    id,
    type: "column",
    accept: "item",
    collisionPriority: ACTION_ZONE_PRIORITY,
    disabled: !visible,
  })

  // A ring, not a scale, marks the target: scale clips in overflow parents.
  return (
    <div
      ref={ref}
      role="region"
      aria-label={regionLabel}
      aria-hidden={!visible}
      data-slot="kanban-action-zone"
      data-drop-target={isDropTarget || undefined}
      className={cn(
        "relative z-10 flex flex-1 items-center justify-center gap-2 border-2 border-dashed p-3",
        "text-sm font-medium transition-[box-shadow,border-color,background-color,color] duration-150",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
        isDropTarget ? zoneTone[tone].active : zoneTone[tone].idle
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {label}
    </div>
  )
}

function ScrollButton({
  side,
  onClick,
}: {
  side: "start" | "end"
  onClick: () => void
}) {
  const Icon = side === "start" ? ChevronLeft : ChevronRight
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      data-slot="kanban-scroll-button"
      aria-label={
        side === "start" ? "Show previous columns" : "Show next columns"
      }
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-20 -translate-y-1/2",
        side === "start" ? "left-1" : "right-1"
      )}
    >
      <Icon />
    </Button>
  )
}

function OverflowFade({
  side,
  visible,
}: {
  side: "start" | "end"
  visible: boolean
}) {
  return (
    <div
      aria-hidden
      data-slot="kanban-overflow-fade"
      data-side={side}
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10 w-10 to-transparent transition-opacity",
        side === "start"
          ? "left-0 bg-gradient-to-r from-background"
          : "right-0 bg-gradient-to-l from-background",
        visible ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

/** Board-shaped placeholder for a route `loading` file. */
function KanbanSkeleton({
  columnCount = 4,
  className,
  columnClassName,
  ...props
}: {
  /** How many placeholder columns to draw. Default 4. */
  columnCount?: number
  /** Classes for every placeholder column, e.g. to match the board's width. */
  columnClassName?: string
} & Omit<React.ComponentProps<"div">, "children">) {
  return (
    <div
      data-slot="kanban-skeleton"
      className={cn("flex gap-4 overflow-hidden", className)}
      {...props}
    >
      {Array.from({ length: columnCount }, (_, index) => (
        <Skeleton key={index} className={cn(columnSize, columnClassName)} />
      ))}
    </div>
  )
}

export { KanbanBoard, KanbanSkeleton }
