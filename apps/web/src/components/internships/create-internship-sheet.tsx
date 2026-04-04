"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type InternshipFieldsFormValues,
  internshipFieldsDefaults,
  internshipFieldsSchema,
  toInternshipStoreBody,
} from "@/components/internships/internship-form";
import { invalidateInternshipCaches } from "@/components/internships/internship-query-invalidation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import {
  getProgramsIndexQueryKey,
  useProgramsIndex,
} from "@/lib/api/generated/context-program/context-program";
import { useInternshipStore } from "@/lib/api/generated/internship/internship";
import { useProgramsStudentsIndex } from "@/lib/api/generated/student/student";

const SEMESTERS = [1, 2, 3, 4, 5, 6] as const;

export function CreateInternshipSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: authData } = useAuthUser();
  const institutionId =
    authData?.status === 200 ? authData.data.current_institution_id : undefined;

  const programsQuery = useProgramsIndex({
    query: {
      queryKey: institutionId
        ? [...getProgramsIndexQueryKey(), institutionId]
        : getProgramsIndexQueryKey(),
      enabled: !!institutionId,
    },
  });

  const programs =
    programsQuery.data?.status === 200 ? programsQuery.data.data.data : [];

  const studentsQuery = useProgramsStudentsIndex(programId, {
    query: { enabled: !!programId && open },
  });

  const students =
    studentsQuery.data?.status === 200 ? studentsQuery.data.data.data : [];

  const form = useForm<InternshipFieldsFormValues>({
    resolver: zodResolver(internshipFieldsSchema),
    defaultValues: internshipFieldsDefaults(),
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    setStudentId("");
    form.reset(internshipFieldsDefaults());
  }, [open, form.reset]);

  const storeMutation = useInternshipStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not create internship");
            return;
          }
          const created = res.data.data;
          await invalidateInternshipCaches(queryClient, {
            program_id: created.program_id,
            student_id: created.student_id,
          });
          toast.success("Internship created");
          setOpen(false);
          setProgramId("");
          setStudentId("");
          form.reset(internshipFieldsDefaults());
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create internship",
          );
        },
      },
    },
    queryClient,
  );

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setProgramId("");
      setStudentId("");
      form.reset(internshipFieldsDefaults());
    }
  }

  async function onSubmit(values: InternshipFieldsFormValues) {
    if (!studentId) {
      toast.error("Select a student");
      return;
    }
    await storeMutation.mutateAsync({
      student: studentId,
      data: toInternshipStoreBody(values),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New internship</SheetTitle>
          <SheetDescription>
            Choose a program and student, then enter placement details.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="create-internship-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <div className="space-y-2">
              <Label>Program</Label>
              <Select
                value={programId || undefined}
                onValueChange={(v) => {
                  setProgramId(v);
                  setStudentId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={studentId || undefined}
                onValueChange={setStudentId}
                disabled={!programId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      programId ? "Select student" : "Choose a program first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                      {s.register_no ? ` (${s.register_no})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {programId &&
              students.length === 0 &&
              !studentsQuery.isLoading ? (
                <p className="text-muted-foreground text-sm">
                  No students in this program.
                </p>
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="industry_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company or organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Trainee developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acad_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2000}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value}
                      onChange={(e) => {
                        const n = e.target.valueAsNumber;
                        field.onChange(Number.isFinite(n) ? n : 2000);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="create-internship-sheet-form"
            disabled={storeMutation.isPending}
          >
            {storeMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
