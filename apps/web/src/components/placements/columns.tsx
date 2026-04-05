import { Placement } from "@/lib/api/generated/models";
import { PermanentJobIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Placement>[] = [
  {
    id: "student",
    header: "Student",
    cell({ row }) {
      return (
        <div className="flex flex-row items-center gap-2.5">
          <HugeiconsIcon className="size-4" icon={PermanentJobIcon} />
          <span>{row.original.student_id}</span>
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
    header: "Created At",
    cell: ({ row }) => {
      return <div>{row.original.created_at}</div>;
    },
  },
];
