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
import {
  placementDetailsDefaults,
  placementDetailsSchema,
  toPlacementStoreBody,
  type PlacementDetailsFormValues,
} from "@/components/placements/placement-details-form";
import { useSearchStudent } from "@/hooks/react-query/useSearchStudent";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import type { Student } from "@/lib/api/generated/models";
import {
  getPlacementListByStudentQueryKey,
  getPlacementsIndexQueryKey,
  usePlacementStore,
} from "@/lib/api/generated/placement/placement";
import { Spinner } from "../ui/spinner";

type Step = "search" | "form";

export function CreatePlacementSheet({ children }: { children: ReactNode }) {
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

  const form = useForm<PlacementDetailsFormValues>({
    resolver: zodResolver(placementDetailsSchema),
    defaultValues: placementDetailsDefaults(),
  });

  const storeMutation = usePlacementStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not create placement");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getPlacementsIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getPlacementListByStudentQueryKey(
              res.data.data.student_id,
            ),
          });
          toast.success("Placement created");
          resetFlow();
          setOpen(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create placement",
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
    form.reset(placementDetailsDefaults());
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
    form.reset(placementDetailsDefaults());
    setStep("form");
  }

  function goBackToSearch() {
    setSelectedStudent(null);
    setStep("search");
    form.reset(placementDetailsDefaults());
  }

  async function onSavePlacement(values: PlacementDetailsFormValues) {
    if (!selectedStudent) {
      toast.error("Select a student");
      return;
    }
    await storeMutation.mutateAsync({
      student: selectedStudent.id,
      data: toPlacementStoreBody(values),
    });
  }

  const isSearchLoading =
    studentSearchQuery.isFetching && submittedQuery.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New placement</SheetTitle>
          <SheetDescription>
            {step === "search"
              ? "Search for a student, then pick them from the results."
              : `Placement details for ${selectedStudent?.full_name ?? "student"}.`}
          </SheetDescription>
        </SheetHeader>

        {step === "search" ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            <form
              className="flex flex-row py-2 gap-1.5"
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
                  <p className="text-muted-foreground flex gap-1.5 items-center text-sm">
                    <Spinner />
                    Searching…
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
              id="create-placement-details-form"
              onSubmit={form.handleSubmit(onSavePlacement)}
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
                    <FormLabel>Industry / company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Work location" {...field} />
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
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ctc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTC</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 6 LPA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
            <SheetFooter className="border-t px-4 py-4 sm:flex-row">
              <Button
                type="submit"
                form="create-placement-details-form"
                disabled={storeMutation.isPending}
              >
                {storeMutation.isPending ? "Saving…" : "Save placement"}
              </Button>
            </SheetFooter>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
