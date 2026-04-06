"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Search01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { invalidateInternshipCaches } from "@/components/internships/internship-query-invalidation";
import { useSearchStudent } from "@/lib/api/hooks/useSearchStudent";
import { useInternshipStore } from "@/lib/api/generated/internship/internship";
import type { Student } from "@/lib/api/generated/models";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { InternshipStoreBody } from "@/lib/api/generated/internship/internship.zod";
import z from "zod";
import { internshipDefaults } from "./internship-form.helpers";

type Step = "search" | "form";

export function CreateInternshipSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("search");
  const [draftQuery, setDraftQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const queryClient = useQueryClient();
  const { students, studentSearchQuery } = useSearchStudent({
    q: submittedQuery,
    enabled: submittedQuery.trim().length > 0,
  });

  const form = useForm({
    resolver: zodResolver(InternshipStoreBody),
    defaultValues: internshipDefaults(),
  });

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
          resetFlow();
          setOpen(false);
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

  function resetFlow() {
    setStep("search");
    setDraftQuery("");
    setSubmittedQuery("");
    setSelectedStudent(null);
    form.reset(internshipDefaults());
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      resetFlow();
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = draftQuery.trim();
    if (!q) {
      toast.error("Enter a search term");
      return;
    }
    setSubmittedQuery(q);
    setSelectedStudent(null);
    setStep("search");
  }

  function selectStudent(student: Student) {
    setSelectedStudent(student);
    form.reset(internshipDefaults());
    setStep("form");
  }

  function goBackToSearch() {
    setSelectedStudent(null);
    setStep("search");
    form.reset(internshipDefaults());
  }

  async function onSubmit(values: z.infer<typeof InternshipStoreBody>) {
    if (!selectedStudent) {
      toast.error("Select a student");
      return;
    }

    await storeMutation.mutateAsync({
      student: selectedStudent.id,
      data: values,
    });
  }

  const isSearchLoading =
    studentSearchQuery.isFetching && submittedQuery.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New internship</SheetTitle>
          <SheetDescription>
            {step === "search"
              ? "Search for a student, then pick them from results."
              : `Internship details for ${selectedStudent?.full_name ?? "student"}.`}
          </SheetDescription>
        </SheetHeader>

        {step === "search" ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            <form
              className="flex flex-row gap-1.5 py-2"
              onSubmit={handleSearchSubmit}
            >
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <HugeiconsIcon icon={Search01Icon} />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search students..."
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                />
              </InputGroup>
              <Button type="submit">Search</Button>
            </form>

            {submittedQuery ? (
              <div className="flex flex-col gap-2">
                {isSearchLoading ? (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <Spinner />
                    Searching...
                  </p>
                ) : students.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No students found. Try a different search.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {students.map((student) => (
                      <li key={student.id}>
                        <button
                          type="button"
                          onClick={() => selectStudent(student)}
                          className="hover:bg-muted/60 flex w-full flex-row items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors"
                        >
                          <HugeiconsIcon
                            className="text-muted-foreground size-4 shrink-0"
                            icon={User02Icon}
                          />
                          <span className="min-w-0 truncate">
                            {student.full_name}
                            {student.register_no
                              ? ` (${student.register_no})`
                              : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Enter a name, register number, or email, then click Search.
              </p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              id="create-internship-sheet-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
            >
              <Button
                type="button"
                variant="ghost"
                className="w-fit gap-1.5 px-2"
                onClick={goBackToSearch}
              >
                <HugeiconsIcon className="size-4" icon={ArrowLeft01Icon} />
                Change student
              </Button>

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
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
            <SheetFooter className="border-t px-4 py-4 sm:flex-row">
              <Button
                type="submit"
                form="create-internship-sheet-form"
                disabled={storeMutation.isPending}
              >
                {storeMutation.isPending ? "Saving..." : "Save internship"}
              </Button>
            </SheetFooter>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
