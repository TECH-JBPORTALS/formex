"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

export const studentSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  staff1: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  createdAt: z.string(),
});

export type Subject = z.infer<typeof studentSchema>;

type StudentColumnActions = {
  onEdit: (student: Subject) => void;
  onDelete: (student: Subject) => void;
};

export function getSubjectColumns({
  onEdit,
  onDelete,
}: StudentColumnActions): ColumnDef<Subject>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Name of Subject",
    },
    {
      accessorKey: "staff1",
      header: "Assigned Staff",
      cell(props) {
        const row = props.row.original;

        return (
          <div className="flex flex-row gap-2.5 items-center">
            <Avatar>
              <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{row.staff1.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
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
