"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { usePendingApprovals } from "@/features/dashboard/hooks/use-dashboard-data";
import type { PendingApprovalItem } from "@/features/dashboard/types/dashboard.types";

const columns: ColumnDef<PendingApprovalItem>[] = [
  { accessorKey: "id", header: "Demande" },
  { accessorKey: "employeeName", header: "Employé" },
  { accessorKey: "leaveType", header: "Type" },
  { accessorKey: "fromDate", header: "Début" },
  { accessorKey: "toDate", header: "Fin" },
  { accessorKey: "days", header: "Jours" },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>
  }
];

export function PendingApprovalsTable() {
  const { data = [], isLoading } = usePendingApprovals();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Card>
      <CardTitle>Workflows en attente</CardTitle>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border text-slate-500 dark:text-slate-300">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-500">
                  Chargement des demandes en attente...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
