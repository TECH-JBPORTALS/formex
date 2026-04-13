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
import { invalidateBridgeCaches } from "@/components/bridges/bridge-query-invalidation";
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
import { Textarea } from "@/components/ui/textarea";
import { useBridgreStore } from "@/lib/api/generated/bridgre/bridgre";
import { useFacultyIndex } from "@/lib/api/generated/institution-faculty/institution-faculty";
import type { Bridge, InstitutionFaculty } from "@/lib/api/generated/models";
import { BridgreStoreBody } from "@/lib/api/generated/bridgre/bridgre.zod";
import z from "zod";
import {
  bridgeCreateDefaults,
  isoFromDateTimeLocal,
  toDateTimeLocalInputValue,
} from "./bridge-form.helpers";

type BridgeCreateValues = z.infer<typeof BridgreStoreBody>;
type Step = "search" | "form";

export function CreateBridgeSheet({
  subjectId,
  children,
}: {
  subjectId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("search");
  const [draftQuery, setDraftQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] =
    useState<InstitutionFaculty | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<BridgeCreateValues>({
    resolver: zodResolver(BridgreStoreBody),
    defaultValues: bridgeCreateDefaults(),
  });

  const facultyQuery = useFacultyIndex({
    query: { enabled: open },
  });
  const facultyRows =
    facultyQuery.data?.status === 200 ? facultyQuery.data.data.data : [];
  const coordinators = facultyRows.filter(
    (faculty) => faculty.role === "course_coordinator",
  );
  const visibleCoordinators = coordinators.filter((coordinator) => {
    if (!submittedQuery.trim()) {
      return false;
    }

    const q = submittedQuery.toLowerCase();
    return (
      coordinator.name.toLowerCase().includes(q) ||
      coordinator.email.toLowerCase().includes(q)
    );
  });

  const storeMutation = useBridgreStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status >= 400) {
            toast.error("Could not create bridge session");
            return;
          }
          const createdBridge = (res as { data?: { data?: unknown } }).data?.data;
          if (!createdBridge) {
            toast.error("Bridge session created but response was unexpected");
            return;
          }
          await invalidateBridgeCaches(
            queryClient,
            createdBridge as Bridge,
          );
          toast.success("Bridge session created");
          resetFlow();
          setOpen(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not create bridge session",
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
    setSelectedCoordinator(null);
    form.reset(bridgeCreateDefaults());
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
      toast.error("Enter a coordinator name or email");
      return;
    }

    setSubmittedQuery(q);
    setStep("search");
  }

  function selectCoordinator(coordinator: InstitutionFaculty) {
    setSelectedCoordinator(coordinator);
    form.setValue("course_coordinator_id", coordinator.id, {
      shouldValidate: true,
    });
    setStep("form");
  }

  function goBackToSearch() {
    setSelectedCoordinator(null);
    form.setValue("course_coordinator_id", "", { shouldValidate: true });
    setStep("search");
  }

  async function onSubmit(values: BridgeCreateValues) {
    if (!selectedCoordinator) {
      toast.error("Select a course coordinator");
      return;
    }

    await storeMutation.mutateAsync({
      subject: subjectId,
      data: BridgreStoreBody.parse({
        ...values,
        course_coordinator_id: selectedCoordinator.id,
      }),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add bridge session</SheetTitle>
          <SheetDescription>
            {step === "search"
              ? "Search and select a course coordinator first."
              : `Bridge session for ${selectedCoordinator?.name ?? "coordinator"}.`}
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
                  placeholder="Search course coordinators..."
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                />
              </InputGroup>
              <Button type="submit">Search</Button>
            </form>

            {submittedQuery ? (
              <div className="flex flex-col gap-2">
                {facultyQuery.isLoading ? (
                  <p className="text-muted-foreground text-sm">Searching...</p>
                ) : visibleCoordinators.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No course coordinators found. Try a different search.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {visibleCoordinators.map((coordinator) => (
                      <li key={coordinator.id}>
                        <button
                          type="button"
                          onClick={() => selectCoordinator(coordinator)}
                          className="hover:bg-muted/60 flex w-full flex-row items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors"
                        >
                          <HugeiconsIcon
                            className="text-muted-foreground size-4 shrink-0"
                            icon={User02Icon}
                          />
                          <span className="min-w-0 truncate">
                            {coordinator.name} ({coordinator.email})
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Enter coordinator name or email, then click Search.
              </p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              id="create-bridge-sheet-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
            >
              <Button
                type="button"
                variant="ghost"
                className="w-fit gap-1.5 px-2"
                onClick={goBackToSearch}
              >
                <HugeiconsIcon className="size-4" icon={ArrowLeft01Icon} />
                Change coordinator
              </Button>

              <FormField
                control={form.control}
                name="curriculum_gap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curriculum gap</FormLabel>
                    <FormControl>
                      <Input placeholder="Gap identified" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Session details"
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

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Venue" {...field} />
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
                name="students_present"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Students present</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value || 0))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevance</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Why this session matters"
                        rows={3}
                        {...field}
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
                form="create-bridge-sheet-form"
                disabled={storeMutation.isPending}
              >
                {storeMutation.isPending ? "Saving..." : "Save bridge session"}
              </Button>
            </SheetFooter>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
