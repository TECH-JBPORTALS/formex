"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { getSubjectColumns, type Subject } from "@/components/subject/columns";
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
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

const placeholderStaff = {
  id: "staff-1",
  name: "Dr. Assigned Staff",
  email: "staff@example.edu",
};

const seed: Subject[] = [
  {
    id: "1",
    code: "CS301",
    name: "Data Structures",
    staff1: placeholderStaff,
    createdAt: "2026-01-08T10:00:00Z",
  },
  {
    id: "2",
    code: "CS302",
    name: "Database Systems",
    staff1: { ...placeholderStaff, id: "staff-2", name: "Prof. Meera Shah" },
    createdAt: "2026-01-09T11:00:00Z",
  },
  {
    id: "3",
    code: "EC201",
    name: "Analog Circuits",
    staff1: { ...placeholderStaff, id: "staff-3", name: "Dr. Ravi K" },
    createdAt: "2026-01-10T09:00:00Z",
  },
];

const subjectFormSchema = z.object({
  code: z.string().min(1, "Subject code is required"),
  name: z.string().min(1, "Name is required"),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export function SubjectsPage() {
  const { programId } = useParams<{ programId: string }>();
  const { data } = useProgramsShow(programId);

  const [subjects, setSubjects] = useState<Subject[]>(seed);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Subject | null>(null);

  const createForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { code: "", name: "" },
  });

  const editForm = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { code: "", name: "" },
  });

  const columns = useMemo(
    () =>
      getSubjectColumns({
        onEdit: (row) => {
          setSelected(row);
          editForm.reset({ code: row.code, name: row.name });
          setEditOpen(true);
        },
        onDelete: (row) => {
          setSelected(row);
          setDeleteOpen(true);
        },
      }),
    [editForm],
  );

  function onCreate(values: SubjectFormValues) {
    const next: Subject = {
      id: crypto.randomUUID(),
      code: values.code,
      name: values.name,
      staff1: placeholderStaff,
      createdAt: new Date().toISOString(),
    };
    setSubjects((prev) => [next, ...prev]);
    createForm.reset();
    setCreateOpen(false);
  }

  function onEditSubmit(values: SubjectFormValues) {
    if (!selected) {
      return;
    }
    setSubjects((prev) =>
      prev.map((row) =>
        row.id === selected.id
          ? { ...row, code: values.code, name: values.name }
          : row,
      ),
    );
    setEditOpen(false);
    setSelected(null);
  }

  function onDeleteConfirm() {
    if (!selected) {
      return;
    }
    setSubjects((prev) => prev.filter((row) => row.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
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

      <Container className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm min-w-[200px]">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search subjects…" />
          </InputGroup>
          <Button onClick={() => setCreateOpen(true)}>
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </div>

        <DataTable columns={columns} data={subjects} />
      </Container>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            createForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add subject</DialogTitle>
            <DialogDescription>
              Add a subject{programId ? ` under program ${programId}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className="space-y-3"
              onSubmit={createForm.handleSubmit(onCreate)}
            >
              <FormField
                control={createForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
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
            <DialogTitle>Edit subject</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className="space-y-3"
              onSubmit={editForm.handleSubmit(onEditSubmit)}
            >
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {selected?.name} ({selected?.code}) from the list
              (demo only).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SubjectPage({ subjectId }: { subjectId: string }) {
  const params = useParams<{ programId?: string }>();
  const programId = params.programId;

  const subject = seed.find((s) => s.id === subjectId) ?? {
    ...seed[0],
    id: subjectId,
    code: "—",
    name: `Subject ${subjectId}`,
  };

  const listHref = programId ? `/p/${programId}/subjects` : "/subjects";

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
                    <Link href={`/p/${programId}`}>Program {programId}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={listHref}>Subjects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subject.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">{subject.name}</CardTitle>
            <CardDescription>
              Code <span className="font-mono">{subject.code}</span>
              {" · "}
              Staff: {subject.staff1.name}
            </CardDescription>
          </CardHeader>
        </Card>
        <p className="text-sm text-muted-foreground">
          Subject detail view — connect this route to your Laravel API when
          ready. Open formats from the sidebar templates as needed.
        </p>
        <Button variant="outline" asChild>
          <Link href={listHref}>Back to subjects</Link>
        </Button>
      </Container>
    </>
  );
}
