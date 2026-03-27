"use client";

// HugeIcons (example)
import { Eye, MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons"; // replace with HugeIcons if installed
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

export const studentSchema = z.object({
  id: z.string(),
  rollNumber: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(), // ISO string
});

export type Student = z.infer<typeof studentSchema>;

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "rollNumber",
    header: "Roll No",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
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
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={MoreVertical} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <HugeiconsIcon icon={Eye} />
              View
            </DropdownMenuItem>

            <DropdownMenuItem>
              <HugeiconsIcon icon={Pencil} />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem variant="destructive">
              <HugeiconsIcon icon={Trash} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
