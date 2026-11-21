
import type { School } from "@/lib/generated/prisma/client"
import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

type SchoolTableProps = {
  schools: School[]
}

export function SchoolTable({ schools }: SchoolTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>School Code</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {schools.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-2xl text-muted-foreground"
            >
              No schools found.
            </TableCell>
          </TableRow>
        ) : (
          schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell>{school.name}</TableCell>

              <TableCell className="font-semibold">
                {school.code ?? "Not assigned"}
              </TableCell>

              <TableCell>{school.address}</TableCell>

              <TableCell>
                <Button  variant="outline" size="sm">
                  <Link href={`/dashboard/schools/${school.id}/edit`}>
                    Configure
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
