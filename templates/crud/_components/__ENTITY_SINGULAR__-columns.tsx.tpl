import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { {{PASCAL_SINGULAR}} } from "../_data/{{ENTITY_PLURAL}}";

export const {{CAMEL_SINGULAR}}Columns: ColumnDef<{{PASCAL_SINGULAR}}>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">{row.original.status}</span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/{{ROUTE_NAME}}/${row.original.id}/edit`}>Edit</Link>
      </Button>
    ),
  },
];
