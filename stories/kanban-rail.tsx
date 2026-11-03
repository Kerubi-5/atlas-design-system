import * as React from "react"

import { KanbanBoard, type KanbanDropTarget } from "../src/kanban.js"

type Deal = { id: string; position: number; stage: string; name: string }

const columns = [
  { id: "new", label: "New", color: "var(--color-muted-foreground)" },
  { id: "talking", label: "Talking", color: "var(--color-primary)" },
  { id: "won", label: "Won", color: "var(--color-success)" },
]

const initialDeals: Deal[] = [
  { id: "1", position: 1, stage: "new", name: "Harbor Coffee" },
  { id: "2", position: 2, stage: "new", name: "North Clinic" },
  { id: "3", position: 1, stage: "talking", name: "Pine Studio" },
]

function getColumnId(deal: Deal) {
  return deal.stage
}

function renderCard(deal: Deal) {
  return <span className="text-sm font-medium">{deal.name}</span>
}

function positionBetween({ beforePosition, afterPosition }: KanbanDropTarget) {
  if (beforePosition == null && afterPosition == null) return 1
  if (beforePosition == null) return afterPosition! - 1
  if (afterPosition == null) return beforePosition + 1
  return (beforePosition + afterPosition) / 2
}

/**
 * Board with Finish and Remove rails. The finish region stays aria-hidden
 * until a drag starts, so Playwright `getByRole` will not see it on press.
 */
export function KanbanRailStory() {
  const [deals, setDeals] = React.useState(initialDeals)

  const moveDeal = React.useCallback(
    (deal: Deal, stage: string, target: KanbanDropTarget) => {
      const position = positionBetween(target)
      setDeals((current) =>
        current
          .map((d) => (d.id === deal.id ? { ...d, stage, position } : d))
          .sort((a, b) => a.position - b.position)
      )
    },
    []
  )

  const leaveBoard = React.useCallback((id: string) => {
    setDeals((current) => current.filter((d) => d.id !== id))
  }, [])

  const openDeal = React.useCallback(() => {
    return undefined
  }, [])

  return (
    <KanbanBoard
      aria-label="Deals"
      columns={columns}
      items={deals}
      getColumnId={getColumnId}
      onMove={moveDeal}
      onCardClick={openDeal}
      onComplete={leaveBoard}
      onDelete={leaveBoard}
      renderCard={renderCard}
      emptyLabel="No deals here"
    />
  )
}
