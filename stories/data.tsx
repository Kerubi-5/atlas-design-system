import { useState } from "react"

import { SortableTableHead } from "../src/sortable-table-head.js"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/table.js"
import { TableBodySkeleton } from "../src/table-body-skeleton.js"

const rows = [
  { name: "North", value: "128" },
  { name: "East", value: "64" },
]

/** Table with a sortable header and a selected row. */
export function TableStory() {
  const [sortKey, setSortKey] = useState<"name" | "value">("name")
  const [direction, setDirection] = useState<"asc" | "desc">("asc")
  const sort = (key: "name" | "value") => {
    setDirection(sortKey === key && direction === "asc" ? "desc" : "asc")
    setSortKey(key)
  }
  const sortedRows = [...rows].sort((a, b) => {
    const comparison =
      sortKey === "name"
        ? a.name.localeCompare(b.name)
        : Number(a.value) - Number(b.value)
    return direction === "asc" ? comparison : -comparison
  })

  return (
    <Table>
      <TableCaption>Regional totals</TableCaption>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sorted={sortKey === "name"}
            direction={direction}
            onClick={() => sort("name")}
          >
            Region
          </SortableTableHead>
          <SortableTableHead
            sorted={sortKey === "value"}
            direction={direction}
            onClick={() => sort("value")}
          >
            Count
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRows.map((row) => (
          <TableRow
            key={row.name}
            data-state={row.name === rows[0]?.name ? "selected" : undefined}
          >
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/** Loading table body used while a query is in flight. */
export function TableBodySkeletonStory() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBodySkeleton columns={3} rows={4} />
    </Table>
  )
}
