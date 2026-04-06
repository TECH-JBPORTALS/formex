"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import { useProgramsStudentsStore } from "@/lib/api/generated/student/student";
import { ProgramsStudentsStoreBody } from "@/lib/api/generated/student/student.zod";
import {
  dateInputValueFromIso,
  getProgramsStudentsQueryKey,
  isoFromDateInput,
} from "./student-form";

const CreateStudentFormSchema = ProgramsStudentsStoreBody.omit({
  semester: true,
});
type CreateStudentFormValues = z.infer<typeof CreateStudentFormSchema>;

function defaultCreateValues(academicYear: number): CreateStudentFormValues {
  return {
    full_name: "",
    date_of_birth: undefined,
    register_no: undefined,
    gender: undefined,
    category: undefined,
    email: undefined,
    mobile: undefined,
    appar_id: undefined,
  };
}

export function CreateStudentSheet({
  programId,
  semester,
  academicYearDefault,
  children,
}: {
  programId: string;
  semester: number;
  academicYearDefault: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const queryKey = getProgramsStudentsQueryKey(programId);

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(CreateStudentFormSchema),
    defaultValues: defaultCreateValues(academicYearDefault),
  });

  const storeMutation = useProgramsStudentsStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 201) {
            toast.error("Could not create student");
            return;
          }
          await queryClient.invalidateQueries({ queryKey });
          toast.success("Student created");
          setOpen(false);
          form.reset(defaultCreateValues(academicYearDefault));
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create student",
          );
        },
      },
    },
    queryClient,
  );

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(defaultCreateValues(academicYearDefault));
    }
  }

  async function onSubmit(values: CreateStudentFormValues) {
    await storeMutation.mutateAsync({
      program: programId,
      data: ProgramsStudentsStoreBody.parse({
        ...values,
        semester,
      }),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add student</SheetTitle>
          <SheetDescription>Semester {semester}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="create-student-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="full_name"
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
              control={form.control}
              name="register_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register no</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={dateInputValueFromIso(field.value ?? null)}
                      onChange={(e) =>
                        field.onChange(isoFromDateInput(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(v) =>
                      field.onChange(
                        v === "__none__" ? undefined : (v as "male" | "female"),
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
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
            form="create-student-sheet-form"
            disabled={storeMutation.isPending}
          >
            {storeMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
