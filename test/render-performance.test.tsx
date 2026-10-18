import { fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { KanbanBoard } from "../src/kanban.js"

import { render } from "./helpers.js"

/**
 * Render counts for interactions that repeat many times a second. Each case
 * failed before its fix; the PR that added it records the before and after.
 */
type Card = { id: string; position: number; stage: string }

const columns = ["todo", "doing", "done"].map((id) => ({ id, label: id }))
const cards: Card[] = columns.flatMap((column) =>
  Array.from({ length: 100 }, (_, index) => ({
    id: `${column.id}-${index}`,
    position: index,
    stage: column.id,
  }))
)
const getColumnId = (card: Card) => card.stage

describe("KanbanBoard scrolling", () => {
  it("does not re-render its cards while scrolling leaves the overflow edges unchanged", () => {
    const renderCard = vi.fn((card: Card) => <span>{card.id}</span>)
    const { container } = render(
      <KanbanBoard
        columns={columns}
        items={cards}
        getColumnId={getColumnId}
        onMove={() => {}}
        renderCard={renderCard}
      />
    )
    const scroller = container.querySelector<HTMLElement>(
      "[data-slot=kanban-scroller]"
    )!
    renderCard.mockClear()
    for (let i = 0; i < 20; i += 1) fireEvent.scroll(scroller)
    expect(renderCard).toHaveBeenCalledTimes(0)
  })
})

describe("KanbanBoard updates", () => {
  it("re-renders only the card whose item changed", () => {
    const renderCard = vi.fn((card: Card) => <span>{card.id}</span>)
    const props = {
      columns,
      getColumnId,
      onMove: () => {},
      renderCard,
    }
    const { rerender } = render(<KanbanBoard {...props} items={cards} />)
    renderCard.mockClear()
    const next = cards.map((card) =>
      card.id === "doing-5" ? { ...card, position: 5.5 } : card
    )
    rerender(<KanbanBoard {...props} items={next} />)
    expect(renderCard).toHaveBeenCalledTimes(1)
    expect(renderCard).toHaveBeenCalledWith(next[105])
  })
})
