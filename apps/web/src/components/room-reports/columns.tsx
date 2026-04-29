"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import type { RoomReport } from "@/lib/api/generated/models";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DeleteRoomReportDialog } from "./delete-room-report-dialog";
import { EditRoomReportSheet } from "./edit-room-report-sheet";

function RoomReportRowActions({
  roomReport,
  programId,
  semester,
}: {
  roomReport: RoomReport;
  programId: string;
  semester: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={MoreVertical} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <HugeiconsIcon icon={Pencil} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <HugeiconsIcon icon={Trash} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRoomReportSheet
        roomReport={roomReport}
        programId={programId}
        semester={semester}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteRoomReportDialog
        roomReport={roomReport}
        programId={programId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getRoomReportColumns({
  programId,
  semester,
}: {
  programId: string;
  semester: number;
}): ColumnDef<RoomReport>[] {
  return [
    {
      accessorKey: "report_date",
      header: "Date",
      cell: ({ row }) => {
        const raw = row.original.report_date;
        const parsed = new Date(raw);

        if (Number.isNaN(parsed.getTime())) {
          return raw;
        }

        return parsed.toLocaleDateString();
      },
    },
    {
      accessorKey: "room_number",
      header: "Room",
    },
    {
      accessorKey: "semester",
      header: "Sem",
    },
    {
      accessorKey: "strength",
      header: "Strength",
    },
    {
      accessorKey: "present",
      header: "Present",
    },
    {
      accessorKey: "topic_taught",
      header: "Topic Taught",
    },
    {
      accessorKey: "learning_outcome",
      header: "Outcome",
    },
    {
      accessorKey: "valuation",
      header: "Valuation",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RoomReportRowActions
          roomReport={row.original}
          programId={programId}
          semester={semester}
        />
      ),
    },
  ];
}
