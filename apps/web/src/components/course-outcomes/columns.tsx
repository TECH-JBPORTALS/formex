"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import type { CourseOutcome } from "@/lib/api/generated/models";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteCourseOutcomeDialog } from "./delete-course-outcome-dialog";
import { EditCourseOutcomeSheet } from "./edit-course-outcome-sheet";

function CourseOutcomeRowActions({ courseOutcome }: { courseOutcome: CourseOutcome }) {
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
      <EditCourseOutcomeSheet
        courseOutcome={courseOutcome}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteCourseOutcomeDialog
        courseOutcome={courseOutcome}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getCourseOutcomeColumns(): ColumnDef<CourseOutcome>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "—",
    },
    {
      accessorKey: "syllabus_scheme",
      header: "Scheme",
      cell: ({ row }) => row.original.syllabus_scheme || "—",
    },
    {
      id: "target_percentage",
      header: "Target %",
      cell: ({ row }) => {
        const targetPercentage = (
          row.original as CourseOutcome & { target_percentage?: number }
        ).target_percentage;

        return targetPercentage ? `${targetPercentage}%` : "—";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <CourseOutcomeRowActions courseOutcome={row.original} />,
    },
  ];
}
