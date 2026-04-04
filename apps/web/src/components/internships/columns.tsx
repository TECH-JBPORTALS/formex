"use client";

import {
  LaborIcon,
  MoreVertical,
  Pencil,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { DeleteInternshipDialog } from "@/components/internships/delete-internship-dialog";
import { EditInternshipSheet } from "@/components/internships/edit-internship-sheet";
import type { Internship } from "@/lib/api/generated/models";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type InternshipColumnsContext = {
  programLabelById: Map<string, string>;
};

function InternshipRowActions({ internship }: { internship: Internship }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={MoreVertical} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setEditOpen(true);
              }}
            >
              <HugeiconsIcon icon={Pencil} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              <HugeiconsIcon icon={Trash} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditInternshipSheet
        internship={internship}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteInternshipDialog
        internship={internship}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

function formatRange(from: string, to: string) {
  try {
    const a = new Date(from);
    const b = new Date(to);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
      return "—";
    }
    return `${format(a, "dd MMM yyyy")} – ${format(b, "dd MMM yyyy")}`;
  } catch {
    return "—";
  }
}

export function getInternshipColumns(
  ctx: InternshipColumnsContext,
): ColumnDef<Internship>[] {
  const { programLabelById } = ctx;

  return [
    {
      accessorKey: "industry_name",
      header: "Industry",
      cell(props) {
        const original = props.row.original;
        return (
          <div className="flex flex-row items-center gap-2.5">
            <HugeiconsIcon className="size-4" icon={LaborIcon} />
            <span>{original.industry_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      id: "program",
      header: "Program",
      cell: ({ row }) => {
        const name = programLabelById.get(row.original.program_id);
        return name ?? <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: "student_id",
      header: "Student",
      cell: ({ row }) => {
        const id = row.original.student_id;
        return (
          <span className="font-mono text-muted-foreground text-xs">
            {id.length > 12 ? `${id.slice(0, 8)}…` : id}
          </span>
        );
      },
    },
    {
      id: "dates",
      header: "Period",
      cell: ({ row }) =>
        formatRange(row.original.from_date, row.original.to_date),
    },
    {
      accessorKey: "semester",
      header: "Sem.",
    },
    {
      accessorKey: "acad_year",
      header: "Year",
    },
    {
      id: "actions",
      cell: ({ row }) => <InternshipRowActions internship={row.original} />,
    },
  ];
}
