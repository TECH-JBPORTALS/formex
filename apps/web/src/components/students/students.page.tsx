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
import { getStudentColumns, type Student } from "@/components/students/columns";
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
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";

const seed: Student[] = [
  {
    id: "1",
    rollNumber: "CS-24001",
    name: "Arjun Nair",
    email: "arjun.nair@student.example.edu",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "2",
    rollNumber: "CS-24002",
    name: "Divya Menon",
    email: "divya.menon@student.example.edu",
    createdAt: "2026-01-11T12:00:00Z",
  },
  {
    id: "3",
    rollNumber: "ECE-24015",
    name: "Kiran Patel",
    email: "kiran.patel@student.example.edu",
    createdAt: "2026-01-12T09:30:00Z",
  },
];

const studentFormSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function StudentsPage() {
  const { programId } = useParams<{ programId: string }>();
  const { data } = useProgramsShow(programId);

  const [students, setStudents] = useState<Student[]>(seed);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const createForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { rollNumber: "", name: "", email: "" },
  });

  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { rollNumber: "", name: "", email: "" },
  });

  const columns = useMemo(
    () =>
      getStudentColumns({
        onEdit: (row) => {
          setSelected(row);
          editForm.reset({
            rollNumber: row.rollNumber,
            name: row.name,
            email: row.email,
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

  function onCreate(values: StudentFormValues) {
    const next: Student = {
      id: crypto.randomUUID(),
      rollNumber: values.rollNumber,
      name: values.name,
      email: values.email,
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [next, ...prev]);
    createForm.reset();
    setCreateOpen(false);
  }

  function onEditSubmit(values: StudentFormValues) {
    if (!selected) {
      return;
    }
    setStudents((prev) =>
      prev.map((row) =>
        row.id === selected.id
          ? {
              ...row,
              rollNumber: values.rollNumber,
              name: values.name,
              email: values.email,
            }
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
    setStudents((prev) => prev.filter((row) => row.id !== selected.id));
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
            <InputGroupInput placeholder="Search students…" />
          </InputGroup>
          <Button onClick={() => setCreateOpen(true)}>
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </div>

        <DataTable columns={columns} data={students} />
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
            <DialogTitle>Add student</DialogTitle>
            <DialogDescription>
              Create a student record
              {programId ? ` for program ${programId}` : ""}.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className="space-y-3"
              onSubmit={createForm.handleSubmit(onCreate)}
            >
              <FormField
                control={createForm.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll number</FormLabel>
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
            <DialogTitle>Edit student</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className="space-y-3"
              onSubmit={editForm.handleSubmit(onEditSubmit)}
            >
              <FormField
                control={editForm.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll number</FormLabel>
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
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {selected?.name} from the list (demo only).
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
