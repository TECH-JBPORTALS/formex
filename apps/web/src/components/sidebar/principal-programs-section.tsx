"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CubeIcon,
  Delete01Icon,
  MoreHorizontal,
  Pen01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CreateProgramDialog,
  DeleteProgramDialog,
  EditProgramDialog,
} from "./dialogs/programs-dialogs";
import {
  programFormSchema,
  type ProgramFormValues,
} from "./dialogs/programs-dialog-schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import type { Program } from "@/lib/api/generated/models/program";
import type { ValidationExceptionResponse } from "@/lib/api/generated/models/validationExceptionResponse";
import type { ValidationExceptionResponseErrors } from "@/lib/api/generated/models/validationExceptionResponseErrors";
import {
  getProgramsIndexQueryKey,
  programsDestroy,
  programsStore,
  programsUpdate,
} from "@/lib/api/generated/context-program/context-program";
import { useProgramsQuery } from "@/hooks/react-query/useProgramsQuery";

function invalidateProgramsList(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: getProgramsIndexQueryKey() });
}

function isValidationError(data: unknown): data is ValidationExceptionResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "errors" in data &&
    typeof (data as ValidationExceptionResponse).message === "string" &&
    typeof (data as ValidationExceptionResponse).errors === "object" &&
    (data as ValidationExceptionResponse).errors !== null
  );
}

function applyApiFieldErrors(
  form: UseFormReturn<ProgramFormValues>,
  errors: ValidationExceptionResponseErrors,
) {
  for (const [key, messages] of Object.entries(errors)) {
    if (!Array.isArray(messages) || !messages[0]) continue;
    form.setError(key as keyof ProgramFormValues, { message: messages[0] });
  }
}

function ProgramListItem({
  program,
  pathname,
  onEdit,
  onDelete,
}: {
  program: Program;
  pathname: string;
  onEdit: (p: Program) => void;
  onDelete: (p: Program) => void;
}) {
  return (
    <SidebarMenuItem className="group/menu-item relative">
      <SidebarMenuButton
        asChild
        isActive={pathname.startsWith(`/p/${program.id}`)}
        className="pr-8"
      >
        <Link href={`/p/${program.id}`}>
          <HugeiconsIcon icon={CubeIcon} />
          <span className="flex-1 truncate">{program.name}</span>
        </Link>
      </SidebarMenuButton>
      <DropdownMenu>
        <SidebarMenuAction asChild showOnHover>
          <DropdownMenuTrigger>
            <HugeiconsIcon icon={MoreHorizontal} className="h-3.5 w-3.5" />
            <span className="sr-only">Program options</span>
          </DropdownMenuTrigger>
        </SidebarMenuAction>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={() => onEdit(program)}>
            <HugeiconsIcon icon={Pen01Icon} className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(program)}
            className="text-destructive focus:text-destructive"
          >
            <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function ProgramsListBody({
  pathname,
  onEdit,
  onDelete,
}: {
  pathname: string;
  onEdit: (program: Program) => void;
  onDelete: (program: Program) => void;
}) {
  const { data: programsResponse, isLoading } = useProgramsQuery();

  if (isLoading)
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <SidebarMenuSkeleton key={i} showIcon={true} />
        ))}
      </>
    );

  if (programsResponse?.status !== 200) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">
        Could not load programs.
      </p>
    );
  }

  const programs = programsResponse.data.data;

  if (programs.length === 0) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">
        No programs yet. Use + to add one.
      </p>
    );
  }

  return programs.map((program) => (
    <ProgramListItem
      key={program.id}
      program={program}
      pathname={pathname}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ));
}

export function PrincipalProgramsSection() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: { name: "", short_name: "", intake: 60 },
  });

  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const editForm = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: { name: "", short_name: "", intake: 60 },
  });

  useEffect(() => {
    if (!editProgram) return;
    editForm.reset({
      name: editProgram.name,
      short_name: editProgram.short_name,
      intake: editProgram.intake,
    });
  }, [editProgram, editForm]);

  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function onCreate(values: ProgramFormValues) {
    const res = await programsStore(values);
    if (res.status === 201) {
      invalidateProgramsList(queryClient);
      toast.success("Program created");
      setCreateOpen(false);
      createForm.reset({ name: "", short_name: "", intake: 60 });
      return;
    }
    if (res.status === 422 && res.data && isValidationError(res.data)) {
      applyApiFieldErrors(createForm, res.data.errors);
      toast.error(res.data.message);
      return;
    }
    toast.error("Could not create program.");
  }

  async function onEditSubmit(values: ProgramFormValues) {
    if (!editProgram) return;
    const res = await programsUpdate(editProgram.id, values);
    if (res.status === 200) {
      invalidateProgramsList(queryClient);
      toast.success("Program updated");
      setEditProgram(null);
      return;
    }
    if (res.status === 422 && res.data && isValidationError(res.data)) {
      applyApiFieldErrors(editForm, res.data.errors);
      toast.error(res.data.message);
      return;
    }
    toast.error("Could not update program.");
  }

  async function confirmDelete() {
    if (!deleteProgram) return;
    setDeleteBusy(true);
    try {
      const res = await programsDestroy(deleteProgram.id);
      if (res.status === 200) {
        invalidateProgramsList(queryClient);
        const id = deleteProgram.id;
        setDeleteProgram(null);
        toast.success("Program deleted");
        if (pathname.startsWith(`/p/${id}`)) {
          window.location.href = "/";
        }
      } else {
        toast.error("Could not delete program.");
      }
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>PROGRAMS</SidebarGroupLabel>
        <SidebarGroupAction
          type="button"
          title="Add program"
          onClick={() => setCreateOpen(true)}
        >
          <HugeiconsIcon icon={PlusSignIcon} />
          <span className="sr-only">Add program</span>
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <ProgramsListBody
              pathname={pathname}
              onEdit={setEditProgram}
              onDelete={setDeleteProgram}
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <CreateProgramDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={createForm}
        onSubmit={onCreate}
      />

      <EditProgramDialog
        open={editProgram !== null}
        onOpenChange={(open) => {
          if (!open) setEditProgram(null);
        }}
        form={editForm}
        onSubmit={onEditSubmit}
      />

      <DeleteProgramDialog
        open={deleteProgram !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteProgram(null);
        }}
        program={deleteProgram}
        busy={deleteBusy}
        onConfirmDelete={confirmDelete}
      />
    </>
  );
}
