import type * as React from "react"
import { describe, expect, it, vi } from "vitest"

import type { KanbanBoardProps } from "../src/kanban.js"

import { render } from "./helpers.js"

/**
 * jsdom has no layout, so a real pointer drag cannot run. Capture the board's
 * dnd-kit handlers and call them with the events dnd-kit would send.
 */
type DragEnd = (event: unknown) => void
const captured: {
  onDragEnd?: DragEnd
  onDragOver?: (event: { preventDefault: () => void }) => void
  overlay?: (source: { id: string } | null) => React.ReactNode
} = {}

vi.mock("@dnd-kit/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/react")>()
  return {
    ...actual,
    DragDropProvider: (
      props: React.ComponentProps<typeof actual.DragDropProvider>
    ) => {
      captured.onDragEnd = props.onDragEnd as DragEnd
      captured.onDragOver = props.onDragOver as typeof captured.onDragOver
      return <actual.DragDropProvider {...props} />
    },
    DragOverlay: ({ children }: { children: typeof captured.overlay }) => {
      captured.overlay = children
      return null
    },
  }
})

vi.mock("@dnd-kit/react/sortable", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@dnd-kit/react/sortable")>()
  return {
    ...actual,
    isSortable: (value: unknown) =>
      (value as { sortable?: boolean } | null)?.sortable === true,
  }
})

const { KanbanBoard } = await import("../src/kanban.js")

type Card = { id: string; position: number; stage: string }

const items: Card[] = [
  { id: "a", position: 1, stage: "todo" },
  { id: "b", position: 2, stage: "todo" },
  { id: "c", position: 5, stage: "doing" },
]

function setup(props: Partial<KanbanBoardProps<Card>> = {}) {
  const handlers = {
    onMove: vi.fn(),
    onComplete: vi.fn(),
    onDelete: vi.fn(),
  }
  render(
    <KanbanBoard
      columns={[
        { id: "todo", label: "To do" },
        { id: "doing", label: "Doing" },
      ]}
      items={items}
      getColumnId={(card) => card.stage}
      renderCard={(card) => <span>card {card.id}</span>}
      {...handlers}
      {...props}
    />
  )
  return handlers
}

function card(id: string, group: string, index: number) {
  return { sortable: true, id, group, initialGroup: "todo", index }
}

function end(source: unknown, target: unknown, canceled = false) {
  captured.onDragEnd!({ canceled, operation: { source, target } })
}

describe("KanbanBoard drops", () => {
  it("moves a card with the positions of its new neighbours", () => {
    const { onMove } = setup()
    end(card("a", "doing", 1), card("c", "doing", 0))
    expect(onMove).toHaveBeenCalledWith(items[0], "doing", {
      beforePosition: 5,
      afterPosition: undefined,
    })
    end(card("b", "todo", 0), { id: "todo" })
    expect(onMove).toHaveBeenLastCalledWith(items[1], "todo", {
      beforePosition: undefined,
      afterPosition: 1,
    })
  })

  it("sends rail drops to complete and delete", () => {
    const { onComplete, onDelete, onMove } = setup()
    end(card("a", "todo", 0), { id: "__kanban_complete__" })
    end(card("b", "todo", 1), { id: "__kanban_delete__" })
    expect(onComplete).toHaveBeenCalledWith("a")
    expect(onDelete).toHaveBeenCalledWith("b")
    expect(onMove).not.toHaveBeenCalled()
  })

  it("ignores cancelled drags, non-card sources, no-op drops, and unknown items", () => {
    const { onMove } = setup()
    end(card("a", "doing", 0), { id: "doing" }, true)
    end(null, { id: "doing" })
    end({ id: "a" }, { id: "doing" })
    end(card("a", "todo", 0), card("a", "todo", 0))
    end(card("zzz", "doing", 0), { id: "doing" })
    end(
      { sortable: true, id: "a", group: null, initialGroup: null, index: "x" },
      null
    )
    expect(onMove).not.toHaveBeenCalled()
  })

  it("keeps dnd-kit from moving cards during the drag", () => {
    setup()
    const preventDefault = vi.fn()
    captured.onDragOver!({ preventDefault })
    expect(preventDefault).toHaveBeenCalled()
  })

  it("draws the dragged card in the overlay with the card classes", () => {
    setup({ cardClassName: "shadow-none" })
    expect(captured.overlay!(null)).toBeNull()
    expect(captured.overlay!({ id: "missing" })).toBeNull()
    const { container } = render(<>{captured.overlay!({ id: "c" })}</>)
    const overlay = container.querySelector('[data-slot="kanban-drag-overlay"]')
    expect(overlay).toHaveTextContent("card c")
    expect(overlay).toHaveClass("shadow-none")
  })
})
