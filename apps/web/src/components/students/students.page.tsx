"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { getStudentColumns } from "@/components/students/columns";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { $api } from "@/lib/api/mutator";
import type { Student } from "@/lib/api/generated/models/student";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

type ApiEnvelope<T> = {
  data: T;
  status: number;
  headers: Headers;
};

type StudentsIndexJson = {
  data: Student[];
};

type StudentStoreJson = {
  message: string;
  data: Student;
};

type StudentDestroyJson = {
  message: string;
};

const studentFormSchema = z.object({
  full_name: z.string().min(1, "Student name is required"),
  date_of_birth: z.string().optional(),
  register_no: z.string().optional(),
  email: z.string().email("Enter a valid email").optional(),
  academic_year: z.number().int().min(2000),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

function emptyToNull(value?: string): string | null {
  const v = value?.trim();
  return !v ? null : v;
}

function clampSemester(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(6, Math.max(1, n));
}

export function StudentsPage() {
  const { programId } = useParams<{ programId: string }>();
  const searchParams = useSearchParams();
  const selectedSemester = clampSemester(searchParams.get("semester"));
  const currentYear = new Date().getFullYear();

  const queryClient = useQueryClient();

  const studentsQueryKey = ["programsStudents", programId] as const;

  const { data: allStudents = [] } = useQuery({
    queryKey: studentsQueryKey,
    enabled: !!programId,
    queryFn: async () => {
      const res = await $api<ApiEnvelope<StudentsIndexJson>>(
        `/programs/${programId}/students`,
        { method: "GET" },
      );

      return res.data.data;
    },
  });

  const [search, setSearch] = useState("");
  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents
      .filter((s) => s.semester === selectedSemester)
      .filter((s) => {
        if (!q) return true;
        return [s.full_name, s.register_no, s.email]
          .filter(Boolean)
          .some((v) => (v ?? "").toLowerCase().includes(q));
      });
  }, [allStudents, search, selectedSemester]);

  const { data: programShow } = useProgramsShow(programId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  type StudentUpsertPayload = {
    full_name: string;
    date_of_birth: string | null;
    register_no: string | null;
    email: string | null;
    semester: number;
    academic_year: number;
  };

  const createForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      register_no: "",
      email: "",
      academic_year: currentYear,
    },
  });

  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      register_no: "",
      email: "",
      academic_year: currentYear,
    },
  });

  const columns = useMemo(
    () =>
      getStudentColumns({
        onEdit: (row) => {
          setSelected(row);
          editForm.reset({
            full_name: row.full_name,
            date_of_birth: row.date_of_birth ?? "",
            register_no: row.register_no ?? "",
            email: row.email ?? "",
            academic_year: row.academic_year,
          });
          setEditOpen(true);
        },
        onDelete: (row) => {
          setSelected(row);
          setDeleteOpen(true);
        },
      }),
    [editForm],
  );

  const createStudentMutation = useMutation({
    mutationFn: async (payload: StudentUpsertPayload) => {
      const res = await $api<ApiEnvelope<StudentStoreJson>>(
        `/programs/${programId}/students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      return res.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
      toast.success("Student created");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not create student",
      );
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: StudentUpsertPayload;
    }) => {
      const res = await $api<ApiEnvelope<StudentStoreJson>>(
        `/programs/${programId}/students/${studentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      return res.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
      toast.success("Student updated");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not update student",
      );
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await $api<ApiEnvelope<StudentDestroyJson>>(
        `/programs/${programId}/students/${studentId}`,
        { method: "DELETE" },
      );

      return res.data.message;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
      toast.success("Student deleted");
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Could not delete student",
      );
    },
  });

  async function onCreate(values: StudentFormValues) {
    const payload: StudentUpsertPayload = {
      full_name: values.full_name,
      date_of_birth: emptyToNull(values.date_of_birth),
      register_no: emptyToNull(values.register_no),
      email: emptyToNull(values.email),
      semester: selectedSemester,
      academic_year: values.academic_year,
    };

    await createStudentMutation.mutateAsync(payload);
    setCreateOpen(false);
    createForm.reset({
      full_name: "",
      date_of_birth: "",
      register_no: "",
      email: "",
      academic_year: currentYear,
    });
  }

  async function onEditSubmit(values: StudentFormValues) {
    if (!selected) return;

    const payload: StudentUpsertPayload = {
      full_name: values.full_name,
      date_of_birth: emptyToNull(values.date_of_birth),
      register_no: emptyToNull(values.register_no),
      email: emptyToNull(values.email),
      semester: selectedSemester,
      academic_year: values.academic_year,
    };

    await updateStudentMutation.mutateAsync({
      studentId: selected.id,
      payload,
    });

    setEditOpen(false);
    setSelected(null);
  }

  async function onDeleteConfirm() {
    if (!selected) return;
    setDeleteBusy(true);
    try {
      await deleteStudentMutation.mutateAsync(selected.id);
      setDeleteOpen(false);
      setSelected(null);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {programId ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/p/${programId}`}>
                      {programShow?.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Students</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm min-w-[200px]">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={createStudentMutation.isPending}
          >
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </div>

        {visibleStudents.length === 0 && createStudentMutation.isPending ? (
          <div className="text-sm text-muted-foreground">Saving…</div>
        ) : null}

        <DataTable columns={columns} data={visibleStudents} />
      </Container>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            createForm.reset({
              full_name: "",
              date_of_birth: "",
              register_no: "",
              email: "",
              academic_year: currentYear,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add student</DialogTitle>
            <DialogDescription>
              Semester {selectedSemester} · Add a student record
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className="space-y-3"
              onSubmit={createForm.handleSubmit(onCreate)}
            >
              <FormField
                control={createForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="register_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createStudentMutation.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Semester {selectedSemester}</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className="space-y-3"
              onSubmit={editForm.handleSubmit(onEditSubmit)}
            >
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="register_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                >
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setSelected(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {selected?.full_name ?? "the student"} from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy || deleteStudentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void onDeleteConfirm()}
              disabled={deleteBusy || deleteStudentMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
