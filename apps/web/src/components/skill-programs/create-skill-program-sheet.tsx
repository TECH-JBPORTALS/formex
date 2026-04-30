"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft01Icon,
  Search01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { invalidateSkillProgramCaches } from "@/components/skill-programs/skill-program-query-invalidation";
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
import { Textarea } from "@/components/ui/textarea";
import { useSearchStudent } from "@/lib/api/hooks/useSearchStudent";
import { useSkillProgramStore } from "@/lib/api/generated/skill-program/skill-program";
import type { SkillProgram, Student } from "@/lib/api/generated/models";
import { SkillProgramStoreBody } from "@/lib/api/generated/skill-program/skill-program.zod";
import z from "zod";
import {
  isoFromDateTimeLocal,
  skillProgramCreateDefaults,
  toDateTimeLocalInputValue,
} from "./skill-program-form.helpers";

type SkillProgramCreateValues = z.infer<typeof SkillProgramStoreBody>;
type Step = "search" | "form";

export function CreateSkillProgramSheet({
  programId,
  children,
}: {
  programId: string;
  children: ReactNode;
}) {
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

  const form = useForm<SkillProgramCreateValues>({
    resolver: zodResolver(SkillProgramStoreBody),
    defaultValues: skillProgramCreateDefaults(),
  });

  const storeMutation = useSkillProgramStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status < 200 || res.status >= 300) {
            toast.error("Could not create skill program");
            return;
          }

          const body = res.data as { data?: SkillProgram } | undefined;
          const created = body?.data;
          await invalidateSkillProgramCaches(queryClient, created ?? {
            program_id: programId,
            semester: selectedStudent?.semester ?? 1,
          });
          toast.success("Skill program created");
          resetFlow();
          setOpen(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not create skill program",
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
    form.reset(skillProgramCreateDefaults());
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
    form.reset(skillProgramCreateDefaults());
    setStep("form");
  }

  function goBackToSearch() {
    setSelectedStudent(null);
    setStep("search");
    form.reset(skillProgramCreateDefaults());
  }

  async function onSubmit(values: SkillProgramCreateValues) {
    if (!selectedStudent) {
      toast.error("Select a student");
      return;
    }
    if (selectedStudent.program_id !== programId) {
      toast.error("Select a student from this program");
      return;
    }

    await storeMutation.mutateAsync({
      student: selectedStudent.id,
      data: SkillProgramStoreBody.parse(values),
    });
  }

  const isSearchLoading =
    studentSearchQuery.isFetching && submittedQuery.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New skill program</SheetTitle>
          <SheetDescription>
            {step === "search"
              ? "Search for a student, then pick them from results."
              : `Skill program details for ${selectedStudent?.full_name ?? "student"}.`}
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
              id="create-skill-program-sheet-form"
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
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Program details"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resource_person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource person</FormLabel>
                    <FormControl>
                      <Input placeholder="Resource person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conducted_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conducted date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={toDateTimeLocalInputValue(field.value)}
                        onChange={(e) =>
                          field.onChange(isoFromDateTimeLocal(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
            <SheetFooter className="border-t px-4 py-4 sm:flex-row">
              <Button
                type="submit"
                form="create-skill-program-sheet-form"
                disabled={storeMutation.isPending}
              >
                {storeMutation.isPending ? "Saving..." : "Save skill program"}
              </Button>
            </SheetFooter>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
