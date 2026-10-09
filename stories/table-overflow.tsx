import { Card, CardContent, CardHeader, CardTitle } from "../src/card.js"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../src/table.js"

const sources = [
  {
    name: "NOAH",
    license: "CC BY 4.0",
    coverage: "National hazard layers",
  },
  {
    name: "MGB",
    license: "CC BY-SA 3.0",
    coverage: "Geohazard maps",
  },
  {
    name: "Ookla",
    license: "CC BY-NC 4.0",
    coverage: "Mobile broadband tiles",
  },
]

function SourcesTable() {
  return (
    <Table>
      <TableCaption>Sources in this build</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Coverage</TableHead>
          <TableHead>License</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sources.map((row) => (
          <TableRow key={row.name}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.coverage}</TableCell>
            <TableCell>{row.license}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * Wide nowrap table in a 390px panel — the QCheck /sources "In this build"
 * case. The scroller must stay inside the panel; LICENSE should not widen
 * the page.
 */
export function NarrowPanelTableStory() {
  return (
    <div className="w-[390px] max-w-full border border-border p-3">
      <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        In this build
      </p>
      <SourcesTable />
    </div>
  )
}

/**
 * Same table inside a Card in a 390px flex column — the barangay profile
 * NOAH / MGB / Ookla case. Card overflow-hidden must not clip LICENSE.
 */
export function ProfileCardTableStory() {
  return (
    <div className="flex w-[390px] max-w-full flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Barangay profile</CardTitle>
        </CardHeader>
        <CardContent>
          <SourcesTable />
        </CardContent>
      </Card>
    </div>
  )
}
