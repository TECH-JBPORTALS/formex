"use client";

import {
  Book02Icon,
  MoreVertical,
  Pencil,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { formatDistanceToNowStrict } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Subject } from "@/lib/api/generated/models";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<Subject>[] = [
  {
    accessorKey: "id",
    header: "Name of Subject",
    cell(props) {
      const original = props.row.original;

      return (
        <div className="flex flex-row gap-2.5 items-center">
          <HugeiconsIcon className="size-4" icon={Book02Icon} />
          <span>{original.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "short_name",
    header: "Short Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell(props) {
      const type = props.getValue() as Subject["type"];
      return (
        <Badge
          variant={type == "theory" ? "secondary" : "outline"}
          className={"capitalize"}
        >
          {props.getValue() as string}
        </Badge>
      );
    },
  },
  {
    accessorKey: "scheme",
    header: "Scheme",
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-right">Created</div>,
    cell: ({ row }) => {
      const raw = row.getValue("created_at") as string | null;
      if (!raw) return <div className="text-right">—</div>;
      const date = new Date(raw);
      return (
        <div className="text-right">
          {formatDistanceToNowStrict(date, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={MoreVertical} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        </div>
      );
    },
  },
];
