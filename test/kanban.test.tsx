import { AutoScroller, Feedback, defaultPreset } from "@dnd-kit/dom"
import {
  OptimisticSortingPlugin,
  SortableKeyboardPlugin,
} from "@dnd-kit/dom/sortable"
import { fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  buildKanbanGroups,
  kanbanOverflowEdges,
  kanbanScrollBy,
  kanbanScrollStepPx,
  resolveKanbanDrop,
} from "../src/internal/kanban-layout.js"
import {
  configureCardSortablePlugins,
  configureKanbanPlugins,
} from "../src/internal/kanban-plugins.js"
import {
  KanbanBoard,
  type KanbanBoardProps,
  KanbanSkeleton,
} from "../src/kanban.js"

import { createUser, render, screen, within } from "./helpers.js"

type Card = { id: string; position: number; title: string; stage: string }

const columns = [
  { id: "todo", label: "To do", color: "#888" },
  { id: "doing", label: "Doing", badge: "$1,200" },
  { id: "done", label: "Done", emptyLabel: "Nothing finished" },
]

const cards: Card[] = [
  { id: "a", position: 1, title: "Write spec", stage: "todo" },
  { id: "b", position: 2, title: "Review spec", stage: "todo" },
  { id: "c", position: 1, title: "Ship it", stage: "doing" },
]

function getColumnId(card: Card) {
  return card.stage
}

function renderCard(card: Card) {
  return <span>{card.title}</span>
}

function renderBoard(props: Partial<KanbanBoardProps<Card>> = {}) {
  return render(
    <KanbanBoard
      columns={columns}
      items={cards}
      getColumnId={getColumnId}
      onMove={vi.fn()}
      renderCard={renderCard}
      {...props}
    />
  )
}

describe("KanbanBoard", () => {
  it("renders columns in order with counts, badges, and empty copy", () => {
    renderBoard({ emptyLabel: "Drop a card" })

    const rendered = document.querySelectorAll('[data-slot="kanban-column"]')
    expect(rendered).toHaveLength(3)
    const [todo, doing, done] = [...rendered] as HTMLElement[]
    expect(todo).toHaveClass("flex-1", "basis-72", "min-w-72")
    expect(todo).not.toHaveClass("w-72", "shrink-0")
    expect(within(todo!).getByText("To do")).toBeInTheDocument()
    expect(within(todo!).getByText("2")).toBeInTheDocument()
    expect(within(todo!).getByText("Write spec")).toBeInTheDocument()
    expect(within(doing!).getByText("$1,200")).toBeInTheDocument()
    expect(within(done!).getByText("Nothing finished")).toBeVisible()
    expect(within(todo!).getByText("Drop a card")).toHaveClass("hidden")
  })

  it("opens a card from its body and keeps the grip separate", async () => {
    const user = createUser()
    const onCardClick = vi.fn()
    renderBoard({ onCardClick })

    await user.click(screen.getByRole("button", { name: "Ship it" }))
    expect(onCardClick).toHaveBeenCalledWith(cards[2])

    const grips = screen.getAllByRole("button", { name: "Drag to move" })
    expect(grips).toHaveLength(3)
    // A real pointer press starts a dnd-kit drag, which needs layout jsdom lacks.
    fireEvent.click(grips[0]!)
    expect(onCardClick).toHaveBeenCalledTimes(1)
  })

  it("renders a static card body when cards do not open", () => {
    renderBoard()
    expect(
      screen.queryByRole("button", { name: "Write spec" })
    ).not.toBeInTheDocument()
    expect(screen.getByText("Write spec")).toBeInTheDocument()
  })

  it("shows skeleton columns while the first load has no items", () => {
    renderBoard({ items: [], isLoading: true })
    expect(
      document.querySelectorAll(
        '[data-slot="kanban-column"] [data-slot="skeleton"]'
      ).length
    ).toBe(6)
    expect(screen.queryByText("Drop here")).not.toBeInTheDocument()
  })

  it("dims the board while a refetch has items", () => {
    renderBoard({ isLoading: true })
    expect(
      document.querySelector('[data-slot="kanban-scroller"]')
    ).toHaveAttribute("data-loading")
  })

  it("keeps the drop rail hidden until a drag starts", () => {
    renderBoard({
      onComplete: vi.fn(),
      onDelete: vi.fn(),
      completeLabel: "Mark done",
    })
    const rail = document.querySelector('[data-slot="kanban-action-rail"]')
    expect(rail).toHaveAttribute("aria-hidden", "true")
    expect(rail).toHaveTextContent("Mark done")
    expect(rail).toHaveTextContent("Remove")
  })

  it("leaves out the drop rail without complete or delete handlers", () => {
    renderBoard()
    expect(
      document.querySelector('[data-slot="kanban-action-rail"]')
    ).not.toBeInTheDocument()
  })

  it("lets the consumer size the board, scroller, columns, and cards", () => {
    renderBoard({
      className: "max-w-3xl",
      scrollerClassName: "gap-2",
      columnClassName: "w-40 min-w-40",
      cardClassName: "shadow-none",
      "aria-label": "Pipeline",
    })
    const root = document.querySelector('[data-slot="kanban-board"]')
    expect(root).toHaveClass("max-w-3xl", "min-w-0")
    expect(root).not.toHaveClass("w-full")
    expect(root).toHaveAttribute("aria-label", "Pipeline")
    const scroller = document.querySelector('[data-slot="kanban-scroller"]')
    expect(scroller).toHaveClass("gap-2")
    expect(scroller).not.toHaveClass("gap-4")
    const column = document.querySelector('[data-slot="kanban-column"]')
    expect(column).toHaveClass("w-40", "min-w-40")
    expect(column).not.toHaveClass("min-w-72")
    const card = document.querySelector('[data-slot="kanban-card"]')
    expect(card).toHaveClass("shadow-none")
    expect(card).not.toHaveClass("shadow-sm")
    expect(
      document.querySelector('[data-slot="kanban-card-handle"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="kanban-column-header"]')
    ).toBeInTheDocument()
  })
})

describe("KanbanSkeleton", () => {
  it("draws one placeholder per column and takes a className", () => {
    render(<KanbanSkeleton columnCount={3} className="gap-2" />)
    const root = document.querySelector('[data-slot="kanban-skeleton"]')
    expect(root).toHaveClass("gap-2")
    expect(root?.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
  })

  it("defaults to four columns", () => {
    render(<KanbanSkeleton columnClassName="w-40" />)
    const placeholders = document.querySelectorAll(
      '[data-slot="kanban-skeleton"] [data-slot="skeleton"]'
    )
    expect(placeholders).toHaveLength(4)
    expect(placeholders[0]).toHaveClass("w-40")
  })
})

describe("buildKanbanGroups", () => {
  it("orders ids by column and skips unknown columns with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const groups = buildKanbanGroups(
      columns,
      [...cards, { id: "x", position: 1, title: "Lost", stage: "gone" }],
      getColumnId
    )
    expect(groups).toEqual({ todo: ["a", "b"], doing: ["c"], done: [] })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"gone"'))
    warn.mockRestore()
  })
})

describe("resolveKanbanDrop", () => {
  const groups = { todo: ["a", "b"], doing: ["c"], done: [] }
  const base = {
    itemId: "a",
    initialGroup: "todo",
    currentGroup: "todo",
    targetGroup: null,
    index: 0,
  }

  it("routes drops on the rail to complete and delete", () => {
    expect(
      resolveKanbanDrop({ ...base, targetId: "__kanban_complete__" }, groups)
    ).toEqual({ kind: "complete", itemId: "a" })
    expect(
      resolveKanbanDrop({ ...base, targetId: "__kanban_delete__" }, groups)
    ).toEqual({ kind: "delete", itemId: "a" })
  })

  it("moves into an empty column by its id", () => {
    expect(
      resolveKanbanDrop({ ...base, targetId: "done", index: 0 }, groups)
    ).toEqual({
      kind: "move",
      itemId: "a",
      toColumnId: "done",
      beforeId: null,
      afterId: null,
    })
  })

  it("finds the column of a card target and its neighbours", () => {
    expect(
      resolveKanbanDrop(
        { ...base, targetId: "c", targetGroup: "doing", index: 1 },
        groups
      )
    ).toEqual({
      kind: "move",
      itemId: "a",
      toColumnId: "doing",
      beforeId: "c",
      afterId: null,
    })
    expect(
      resolveKanbanDrop({ ...base, targetId: "c", index: 0 }, groups)
    ).toMatchObject({ toColumnId: "doing", beforeId: null, afterId: "c" })
  })

  it("reorders within a column and ignores a drop back in place", () => {
    expect(
      resolveKanbanDrop({ ...base, targetId: "b", index: 1 }, groups)
    ).toEqual({
      kind: "move",
      itemId: "a",
      toColumnId: "todo",
      beforeId: "b",
      afterId: null,
    })
    expect(
      resolveKanbanDrop({ ...base, targetId: "a", index: 0 }, groups)
    ).toBeNull()
  })

  it("falls back to the current group and clamps the index", () => {
    expect(
      resolveKanbanDrop(
        { ...base, targetId: null, currentGroup: "doing", index: 9 },
        groups
      )
    ).toMatchObject({ toColumnId: "doing", beforeId: "c", afterId: null })
    expect(
      resolveKanbanDrop(
        { ...base, targetId: "doing", index: undefined },
        groups
      )
    ).toMatchObject({ toColumnId: "doing", beforeId: "c" })
  })

  it("ignores drops it cannot place", () => {
    expect(
      resolveKanbanDrop({ ...base, targetId: null, currentGroup: null }, groups)
    ).toBeNull()
    expect(
      resolveKanbanDrop(
        { ...base, initialGroup: null, targetId: "done" },
        groups
      )
    ).toBeNull()
  })
})

describe("kanbanOverflowEdges", () => {
  it("hides both cues when content fits", () => {
    expect(kanbanOverflowEdges(0, 375, 375)).toEqual({
      start: false,
      end: false,
    })
  })

  it("shows the end cue at the start of an overflowing board", () => {
    expect(kanbanOverflowEdges(0, 343, 1132)).toEqual({
      start: false,
      end: true,
    })
  })

  it("shows both cues in the middle and only the start cue at the end", () => {
    expect(kanbanOverflowEdges(200, 343, 1132)).toEqual({
      start: true,
      end: true,
    })
    expect(kanbanOverflowEdges(789, 343, 1132)).toEqual({
      start: true,
      end: false,
    })
  })
})

describe("kanbanScrollBy", () => {
  it("pages by most of the viewport, never less than one narrow column", () => {
    expect(kanbanScrollStepPx(343)).toBe(Math.round(343 * 0.75))
    expect(kanbanScrollStepPx(80)).toBe(140)
  })

  it("no-ops without a scroller and scrolls one step when present", () => {
    kanbanScrollBy(null, 1)
    const scrollBy = vi.fn()
    kanbanScrollBy({ clientWidth: 200, scrollBy }, 1)
    expect(scrollBy).toHaveBeenCalledWith({
      left: kanbanScrollStepPx(200),
      behavior: "smooth",
    })
    kanbanScrollBy({ clientWidth: 200, scrollBy }, -1)
    expect(scrollBy).toHaveBeenLastCalledWith({
      left: -kanbanScrollStepPx(200),
      behavior: "smooth",
    })
  })
})

/**
 * Feedback must stay active so DragOverlay is positioned; `feedback: "none"`
 * leaves a static overlay. Checked against the real default preset so a
 * dnd-kit upgrade fails here.
 */
describe("kanban plugins", () => {
  const result = configureKanbanPlugins([...defaultPreset.plugins])

  it("keeps AutoScroller and every other default plugin", () => {
    expect(result).toContain(AutoScroller)
    for (const plugin of defaultPreset.plugins.filter((p) => p !== Feedback)) {
      expect(result).toContain(plugin)
    }
  })

  it("keeps Feedback with the drop animation off", () => {
    expect(result).not.toContain(Feedback)
    expect(
      result.find((p) => typeof p === "object" && p !== null)
    ).toMatchObject({ plugin: Feedback, options: { dropAnimation: null } })
  })

  it("drops OptimisticSortingPlugin from cards", () => {
    const cardPlugins = configureCardSortablePlugins([
      SortableKeyboardPlugin,
      OptimisticSortingPlugin,
    ])
    expect(cardPlugins).toContain(SortableKeyboardPlugin)
    expect(cardPlugins).not.toContain(OptimisticSortingPlugin)
  })
})

describe("KanbanBoard overflow cues", () => {
  it("shows fades and scroll buttons once columns overflow", async () => {
    const user = createUser()
    renderBoard()
    const scroller = document.querySelector<HTMLElement>(
      '[data-slot="kanban-scroller"]'
    )!
    Object.defineProperties(scroller, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
    })
    const scrollBy = vi.fn()
    scroller.scrollBy = scrollBy as typeof scroller.scrollBy

    scroller.scrollLeft = 200
    fireEvent.scroll(scroller)
    expect(scroller).toHaveAttribute("data-overflow-start")
    expect(scroller).toHaveAttribute("data-overflow-end")
    expect(
      screen.getByText(
        "More columns available. Scroll horizontally to see them."
      )
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Show next columns" }))
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 225, behavior: "smooth" })
    await user.click(
      screen.getByRole("button", { name: "Show previous columns" })
    )
    expect(scrollBy).toHaveBeenLastCalledWith({
      left: -225,
      behavior: "smooth",
    })
  })
})

describe("KanbanBoard render counts", () => {
  // Interactions that repeat many times a second. Each case failed before
  // its fix; the PR that added it records the before and after.
  const stages = ["todo", "doing", "done"].map((id) => ({ id, label: id }))
  const manyCards: Card[] = stages.flatMap((column) =>
    Array.from({ length: 100 }, (_, index) => ({
      id: `${column.id}-${index}`,
      position: index,
      title: `${column.id} ${index}`,
      stage: column.id,
    }))
  )

  it("does not re-render its cards while scrolling leaves the overflow edges unchanged", () => {
    const renderCard = vi.fn((card: Card) => <span>{card.id}</span>)
    const { container } = renderBoard({
      columns: stages,
      items: manyCards,
      renderCard,
    })
    const scroller = container.querySelector<HTMLElement>(
      "[data-slot=kanban-scroller]"
    )!
    renderCard.mockClear()
    for (let i = 0; i < 20; i += 1) fireEvent.scroll(scroller)
    expect(renderCard).toHaveBeenCalledTimes(0)
  })

  it("re-renders only the card whose item changed", () => {
    const renderCard = vi.fn((card: Card) => <span>{card.id}</span>)
    const props = {
      columns: stages,
      getColumnId,
      onMove: () => {},
      renderCard,
    }
    const { rerender } = render(<KanbanBoard {...props} items={manyCards} />)
    renderCard.mockClear()
    const next = manyCards.map((card) =>
      card.id === "doing-5" ? { ...card, position: 5.5 } : card
    )
    rerender(<KanbanBoard {...props} items={next} />)
    expect(renderCard).toHaveBeenCalledTimes(1)
    expect(renderCard).toHaveBeenCalledWith(next[105])
  })
})
