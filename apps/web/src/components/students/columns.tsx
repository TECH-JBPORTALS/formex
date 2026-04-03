"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Student } from "@/lib/api/generated/models/student";

type StudentColumnActions = {
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
};

export function getStudentColumns({
  onEdit,
  onDelete,
}: StudentColumnActions): ColumnDef<Student>[] {
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
      accessorKey: "semester",
      header: "Semester",
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
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={MoreVertical} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(student)}>
                <HugeiconsIcon icon={Pencil} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(student)}
              >
                <HugeiconsIcon icon={Trash} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
