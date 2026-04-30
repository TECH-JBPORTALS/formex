"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import {
  getSubjectColumns,
  type SubjectRow,
} from "@/components/subjects/columns";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSubjectListbysemesterQueryKey,
  useSubjectListbysemester,
  useSubjectStore,
} from "@/lib/api/generated/subject/subject";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import { SpinnerPage } from "../spinner-page";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function clampSemester(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(6, Math.max(1, n));
}

export function SubjectsPage() {
  const { programId } = useParams<{ programId: string }>();
  const searchParams = useSearchParams();
  const selectedSemester = clampSemester(searchParams.get("semester"));
  const { data } = useProgramsShow(programId);

  const subjectsQuery = useSubjectListbysemester(
    programId ?? "",
    selectedSemester,
    {
      query: { enabled: !!programId },
    },
  );

  const rows: SubjectRow[] =
    subjectsQuery.data?.status === 200
      ? (subjectsQuery.data.data.data as SubjectRow[])
      : [];

  const subjectColumns = useMemo(
    () =>
      getSubjectColumns({
        programId,
        listSemester: selectedSemester,
      }),
    [programId, selectedSemester],
  );

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
                    <Link href={`/p/${programId}`}>{data?.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Subjects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm min-w-[200px]">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search subjects…" />
          </InputGroup>
          {programId ? (
            <CreateSubjectDialog
              programId={programId}
              semester={selectedSemester}
            >
              <Button>
                Add <HugeiconsIcon icon={PlusSignIcon} />
              </Button>
            </CreateSubjectDialog>
          ) : null}
        </div>

        {subjectsQuery.isLoading ? (
          <SpinnerPage />
        ) : (
          <DataTable columns={subjectColumns} data={rows} />
        )}
      </Container>
    </>
  );
}

const CreateSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  short_name: z.string().min(1, "Short name is required").max(10),
  code: z.string().min(1, "Code is required").max(50),
  type: z.enum(["theory", "practical"]),
  scheme: z.string().min(1, "Scheme is required").max(50),
});
type CreateSubjectFormValues = z.infer<typeof CreateSubjectSchema>;

const createSubjectDefaults: CreateSubjectFormValues = {
  code: "",
  name: "",
  scheme: "",
  short_name: "",
  type: "theory",
};

export function CreateSubjectDialog({
  programId,
  semester,
  children,
}: {
  programId: string;
  semester: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CreateSubjectSchema),
    defaultValues: createSubjectDefaults,
  });

  const storeMutation = useSubjectStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not create subject");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getSubjectListbysemesterQueryKey(programId, semester),
          });
          toast.success("Subject created");
          setOpen(false);
          form.reset(createSubjectDefaults);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create subject",
          );
        },
      },
    },
    queryClient,
  );

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(createSubjectDefaults);
    }
  }

  async function onSubmit(values: CreateSubjectFormValues) {
    await storeMutation.mutateAsync({
      program: programId,
      data: { ...values, semester },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Subject</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="create-subject-form"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Subject name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CS101" maxLength={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. CS-101"
                      maxLength={50}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. C25, R23"
                      maxLength={50}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-muted-foreground text-sm">
              Semester {semester} (from the program sidebar). Change it there to
              add subjects to another semester.
            </p>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-subject-form"
            disabled={storeMutation.isPending}
          >
            {storeMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
