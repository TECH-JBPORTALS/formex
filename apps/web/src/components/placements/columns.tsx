"use client";

import {
  MoreVertical,
  Pencil,
  PermanentJobIcon,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { DeletePlacementDialog } from "@/components/placements/delete-placement-dialog";
import { EditPlacementSheet } from "@/components/placements/edit-placement-sheet";
import type { Placement } from "@/lib/api/generated/models";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function PlacementRowActions({ placement }: { placement: Placement }) {
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

      <EditPlacementSheet
        placement={placement}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeletePlacementDialog
        placement={placement}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

function formatCreatedAt(iso: string | null) {
  if (!iso) {
    return "—";
  }
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return "—";
    }
    return format(d, "dd MMM yyyy");
  } catch {
    return "—";
  }
}

export function getPlacementColumns(): ColumnDef<Placement>[] {
  return [
    {
      id: "student",
      header: "Student",
      cell({ row }) {
        const id = row.original.student;
        return (
          <div className="flex flex-row items-center gap-2.5">
            <HugeiconsIcon className="size-4" icon={PermanentJobIcon} />
            <span className="font-mono text-muted-foreground text-xs">
              {id.length > 12 ? `${id.slice(0, 8)}…` : id}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "industry_name",
      header: "Industry",
      cell: ({ row }) => {
        return <div>{row.original.industry_name}</div>;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return <div>{row.original.role}</div>;
      },
    },
    {
      accessorKey: "ctc",
      header: "CTC",
      cell: ({ row }) => {
        return <div>{row.original.ctc}</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground text-sm">
            {formatCreatedAt(row.original.created_at)}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <PlacementRowActions placement={row.original} />,
    },
  ];
}
