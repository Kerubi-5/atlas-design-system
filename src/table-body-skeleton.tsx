import { Skeleton } from "./skeleton.js"
import { TableBody, TableCell, TableRow } from "./table.js"

type Props = {
  columns: number
  rows?: number
}

/**
 * Skeleton table body rows for client query loading states. The body is
 * `aria-busy` and the placeholder cells are hidden, so a screen reader hears
 * that the table is loading instead of rows of empty cells.
 */
export function TableBodySkeleton({ columns, rows = 5 }: Props) {
  return (
    <TableBody aria-busy="true">
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row} aria-hidden="true">
          {Array.from({ length: columns }, (_, col) => (
            <TableCell key={col}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
