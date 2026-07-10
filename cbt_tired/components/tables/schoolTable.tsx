import type { School } from "@/lib/generated/prisma/client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SchoolTableProps = {
  schools: School[]
}

export function SchoolTable({ schools }: SchoolTableProps) {
    // schools.length=0
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {schools.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={2}
              className="text-center text-2xl text-muted-foreground"
            >
              No schools found.
            </TableCell>
          </TableRow>
        ) : (
          schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell>{school.name}</TableCell>
              <TableCell>{school.address}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
