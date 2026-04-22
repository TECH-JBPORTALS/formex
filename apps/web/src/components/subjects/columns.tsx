"use client";

import {
  Book02Icon,
  MoreVertical,
  Pencil,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { DeleteSubjectDialog } from "@/components/subjects/delete-subject-dialog";
import { EditSubjectDialog } from "@/components/subjects/edit-subject-dialog";
import {
  type AssignedStaff,
  SubjectAssignmentCell,
} from "@/components/subjects/subject-assignment-cell";
import type { Subject } from "@/lib/api/generated/models";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type SubjectColumnsContext = {
  programId: string | undefined;
  listSemester: number;
};

export type SubjectRow = Subject & {
  assigned_staff?: AssignedStaff[];
};

function SubjectRowActions({
  subject,
  programId,
  listSemester,
}: {
  subject: SubjectRow;
  programId: string;
  listSemester: number;
}) {
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

      <EditSubjectDialog
        subject={subject}
        programId={programId}
        listSemester={listSemester}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteSubjectDialog
        subject={subject}
        programId={programId}
        listSemester={listSemester}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getSubjectColumns(
  ctx: SubjectColumnsContext,
): ColumnDef<SubjectRow>[] {
  const { programId, listSemester } = ctx;

  return [
    {
      accessorKey: "id",
      header: "Name of Subject",
      cell(props) {
        const original = props.row.original;
        const subjectLabel = (
          <div className="flex flex-row gap-2.5 items-center">
            <HugeiconsIcon className="size-4" icon={Book02Icon} />
            <span>{original.name}</span>
          </div>
        );

        if (!programId) {
          return subjectLabel;
        }

        return (
          <Link href={`/p/${programId}/s/${original.id}`}>{subjectLabel}</Link>
        );
      },
    },
    {
      accessorKey: "short_name",
      header: "Short Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      id: "assigned_people",
      header: "Assigned People",
      cell(props) {
        return (
          <SubjectAssignmentCell
            subjectId={props.row.original.id}
            initialAssignedStaff={props.row.original.assigned_staff ?? []}
          />
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell(props) {
        const type = props.row.original.type;
        return (
          <Badge
            variant={type === "theory" ? "secondary" : "outline"}
            className={"capitalize"}
          >
            {type}
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
      cell: ({ row }) =>
        programId ? (
          <SubjectRowActions
            subject={row.original}
            programId={programId}
            listSemester={listSemester}
          />
        ) : (
          <div className="text-right text-muted-foreground text-sm">—</div>
        ),
    },
  ];
}
