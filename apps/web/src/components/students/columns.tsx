"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DeleteStudentDialog } from "@/components/students/delete-student-dialog";
import { EditStudentSheet } from "@/components/students/edit-student-sheet";
import type { Student } from "@/lib/api/generated/models/student";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type StudentColumnsContext = {
  programId: string | undefined;
  listSemester: number;
};

function StudentRowActions({
  student,
  programId,
  listSemester,
}: {
  student: Student;
  programId: string;
  listSemester: number;
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

      <EditStudentSheet
        student={student}
        programId={programId}
        listSemester={listSemester}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteStudentDialog
        student={student}
        programId={programId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getStudentColumns(
  ctx: StudentColumnsContext,
): ColumnDef<Student>[] {
  const { programId, listSemester } = ctx;

  return [
    {
      accessorKey: "full_name",
      header: "Student",
    },
    {
      accessorKey: "register_no",
      header: "Roll No",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "academic_year",
      header: "Academic Year",
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string | null;
        if (!createdAt) return null;
        const date = new Date(createdAt);
        return date.toLocaleDateString();
      },
    },
    {
      id: "actions",
      cell: ({ row }) =>
        programId ? (
          <StudentRowActions
            student={row.original}
            programId={programId}
            listSemester={listSemester}
          />
        ) : (
          <div className="text-muted-foreground text-sm">—</div>
        ),
    },
  ];
}
