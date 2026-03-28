"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Container from "../container";
import { DataTable } from "../data-table";
import Header from "../header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { getSubjectColumns, type Subject } from "./columns";

export const students: Subject[] = [
  {
    id: "1",
    code: "001",
    name: "Applied Science",
    staff1: { email: "arjun@example.com", name: "Arjun", id: "1" },
    createdAt: "2026-01-10T10:30:00Z",
  },
  {
    id: "2",
    code: "002",
    name: "Mathemetics",

    staff1: { email: "sneha@example.com", name: "Sneha", id: "2" },
    createdAt: "2026-01-12T12:00:00Z",
  },
  {
    id: "3",
    code: "003",
    name: "Network Security",

    staff1: { email: "rahul@example.com", name: "Rahul", id: "2" },
    createdAt: "2026-01-15T09:15:00Z",
  },
  {
    id: "4",
    code: "004",
    staff1: { email: "meghana@example.com", name: "Meghana", id: "2" },
    name: "Web Programming",
    createdAt: "2026-01-18T14:45:00Z",
  },
];

const subjectFormSchema = z.object({
  code: z.string().min(1, "Roll number is required"),
  name: z.string().min(1, "Name is required"),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

export function SubjectsPage() {
  const [studentList, setStudentList] = useState<Subject[]>(students);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Subject | null>(null);

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
        onEdit: (student) => {
          setSelectedStudent(student);
          editForm.reset({
            code: student.code,
            name: student.name,
          });
          setEditOpen(true);
        },
        onDelete: (student) => {
          setSelectedStudent(student);
          setDeleteOpen(true);
        },
      }),
    [editForm],
  );

  function onCreate(values: SubjectFormValues) {
    const newStudent: Subject = {
      id: crypto.randomUUID(),
      code: values.code,
      name: values.name,
      createdAt: new Date().toISOString(),
      staff1: { id: "2", email: "example@gmail.com", name: "Ramesh Arvind" },
    };

    setStudentList((prev) => [newStudent, ...prev]);
    createForm.reset();
    setCreateOpen(false);
  }

  function onEdit(values: SubjectFormValues) {
    if (!selectedStudent) return;

    setStudentList((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id ? { ...student, ...values } : student,
      ),
    );
    setEditOpen(false);
    setSelectedStudent(null);
  }

  function onDelete() {
    if (!selectedStudent) return;

    setStudentList((prev) =>
      prev.filter((student) => student.id !== selectedStudent.id),
    );
    setDeleteOpen(false);
    setSelectedStudent(null);
  }

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Subjects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container className="space-y-4">
        <div className="flex justify-between">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
          </InputGroup>
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) createForm.reset();
            }}
          >
            <Button onClick={() => setCreateOpen(true)}>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create subject</DialogTitle>
                <DialogDescription>
                  Add basic subject information.
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
                        <FormLabel>Subject Code</FormLabel>
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
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns} data={studentList} />
      </Container>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedStudent(null);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit subject</SheetTitle>
            <SheetDescription>Update subject information.</SheetDescription>
          </SheetHeader>
          <Form {...editForm}>
            <form
              className="space-y-3 px-4"
              onSubmit={editForm.handleSubmit(onEdit)}
            >
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
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
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
