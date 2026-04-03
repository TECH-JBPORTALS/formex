"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CubeIcon,
  Delete01Icon,
  LoaderCircle,
  MoreHorizontal,
  Pen01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import type { Program } from "@/lib/api/generated/models/program";
import type { ValidationExceptionResponse } from "@/lib/api/generated/models/validationExceptionResponse";
import {
  getProgramsIndexQueryKey,
  programsDestroy,
  programsStore,
  programsUpdate,
  useProgramsIndex,
} from "@/lib/api/generated/program/program";

const programFormSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  short_name: z.string().min(1, "Required").max(50),
  intake: z.number().int().min(1, "At least 1"),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

function invalidateProgramsQueries(
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

export function PrincipalProgramsSection() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: authData } = useAuthUser();
  const session = authData?.status === 200 ? authData.data : null;
  const institutionId = session?.current_institution_id ?? null;

  const { data: programsData, isPending: programsLoading } = useProgramsIndex({
    query: {
      queryKey: [...getProgramsIndexQueryKey(), institutionId ?? ""],
      enabled: Boolean(institutionId),
    },
  });

  const programs: Program[] =
    programsData?.status === 200 ? programsData.data.data : [];

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
    if (editProgram) {
      editForm.reset({
        name: editProgram.name,
        short_name: editProgram.short_name,
        intake: editProgram.intake,
      });
    }
  }, [editProgram, editForm]);

  const [deleteProgram, setDeleteProgram] = useState<Program | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function onCreate(values: ProgramFormValues) {
    const res = await programsStore(values);
    if (res.status === 201) {
      toast.success("Program created");
      setCreateOpen(false);
      createForm.reset({ name: "", short_name: "", intake: 60 });
      invalidateProgramsQueries(queryClient);
      return;
    }
    if (res.status === 422 && res.data && isValidationError(res.data)) {
      const { message, errors } = res.data;
      for (const [key, messages] of Object.entries(errors)) {
        if (!Array.isArray(messages) || !messages[0]) continue;
        createForm.setError(key as keyof ProgramFormValues, {
          message: messages[0],
        });
      }
      toast.error(message);
      return;
    }
    toast.error("Could not create program.");
  }

  async function onEdit(values: ProgramFormValues) {
    if (!editProgram) return;
    const res = await programsUpdate(editProgram.id, values);
    if (res.status === 200) {
      toast.success("Program updated");
      setEditProgram(null);
      invalidateProgramsQueries(queryClient);
      return;
    }
    if (res.status === 422 && res.data && isValidationError(res.data)) {
      const { message, errors } = res.data;
      for (const [key, messages] of Object.entries(errors)) {
        if (!Array.isArray(messages) || !messages[0]) continue;
        editForm.setError(key as keyof ProgramFormValues, {
          message: messages[0],
        });
      }
      toast.error(message);
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
        toast.success("Program deleted");
        setDeleteProgram(null);
        invalidateProgramsQueries(queryClient);
        if (pathname.startsWith(`/p/${deleteProgram.id}`)) {
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
            {!institutionId ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                Select an institution to load programs.
              </p>
            ) : programsLoading ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                Loading…
              </p>
            ) : programs.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                No programs yet. Use + to add one.
              </p>
            ) : (
              programs.map((program) => (
                <SidebarMenuItem
                  key={program.id}
                  className="group/menu-item relative"
                >
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
                        <HugeiconsIcon
                          icon={MoreHorizontal}
                          className="h-3.5 w-3.5"
                        />
                        <span className="sr-only">Program options</span>
                      </DropdownMenuTrigger>
                    </SidebarMenuAction>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem onClick={() => setEditProgram(program)}>
                        <HugeiconsIcon
                          icon={Pen01Icon}
                          className="mr-2 h-3.5 w-3.5"
                        />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteProgram(program)}
                        className="text-destructive focus:text-destructive"
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          className="mr-2 h-3.5 w-3.5"
                        />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New program</DialogTitle>
            <DialogDescription>
              Adds a program to{" "}
              {session?.current_institution?.name ?? "your institution"}.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className="space-y-3"
              onSubmit={createForm.handleSubmit(onCreate)}
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="short_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="intake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intake</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.valueAsNumber || e.target.value,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                >
                  {createForm.formState.isSubmitting ? (
                    <>
                      <HugeiconsIcon
                        icon={LoaderCircle}
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                      Saving…
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editProgram !== null}
        onOpenChange={(open) => !open && setEditProgram(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit program</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className="space-y-3"
              onSubmit={editForm.handleSubmit(onEdit)}
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="short_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="intake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intake</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.valueAsNumber || e.target.value,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProgram(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                >
                  {editForm.formState.isSubmitting ? (
                    <>
                      <HugeiconsIcon
                        icon={LoaderCircle}
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                      Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteProgram !== null}
        onOpenChange={(open) => !open && setDeleteProgram(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete program?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteProgram?.name}</strong> and related data may be
              affected. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBusy}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleteBusy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
