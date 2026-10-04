import { Skeleton } from "./skeleton.js"
import { TableBody, TableCell, TableRow } from "./table.js"

type Props = {
  columns: number
  rows?: number
}

/** Skeleton table body rows for client query loading states. */
export function TableBodySkeleton({ columns, rows = 5 }: Props) {
  return (
    <TableBody>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row}>
          {Array.from({ length: columns }, (_, col) => (
            <TableCell key={col}>
              <Skeleton className="h-4 w-full max-w-[12rem]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
