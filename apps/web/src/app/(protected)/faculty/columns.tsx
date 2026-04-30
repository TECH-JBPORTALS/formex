"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { InstitutionFaculty } from "@/lib/api/generated/models";
import { Badge } from "../../../components/ui/badge";

type FacultyColumnsOptions = {
  canManage: boolean;
  onEdit: (faculty: InstitutionFaculty) => void;
  onDelete: (faculty: InstitutionFaculty) => void;
  onReactivate: (faculty: InstitutionFaculty) => void;
};

export function getFacultyColumns({
  canManage,
  onEdit,
  onDelete,
  onReactivate,
}: FacultyColumnsOptions): ColumnDef<InstitutionFaculty>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;

        return <Badge variant="outline">{role.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
    },
    {
      accessorKey: "programs",
      header: "Programs",
      cell: ({ row }) => {
        const programs = row.original.programs.map((program) => program.name);
        if (programs.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="line-clamp-1">{programs.join(", ")}</span>;
      },
    },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }) => {
        const subjects = row.original.subjects.map((subject) => subject.name);
        if (subjects.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="line-clamp-1">{subjects.join(", ")}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (!canManage) {
          return <span className="text-muted-foreground">Restricted</span>;
        }

        if (!row.original.is_active) {
          return (
            <Button
              type="button"
              size="sm"
              onClick={() => onReactivate(row.original)}
            >
              Reactivate
            </Button>
          );
        }

        return (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              Deactivate
            </Button>
          </div>
        );
      },
    },
  ];
}
