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
  const [sorted, setSorted] = useState(true)
  const [direction, setDirection] = useState<"asc" | "desc">("asc")

  return (
    <Table>
      <TableCaption>Regional totals</TableCaption>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sorted={sorted}
            direction={direction}
            onClick={() => {
              if (!sorted) {
                setSorted(true)
                setDirection("asc")
                return
              }
              setDirection((current) => (current === "asc" ? "desc" : "asc"))
            }}
          >
            Region
          </SortableTableHead>
          <TableHead>Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow
            key={row.name}
            data-state={index === 0 ? "selected" : undefined}
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
