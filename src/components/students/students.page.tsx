"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Download01Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
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
import { getStudentColumns, type Student } from "./columns";

export const students: Student[] = [
  {
    id: "1",
    rollNumber: "001",
    name: "Arjun Reddy",
    email: "arjun@example.com",
    createdAt: "2026-01-10T10:30:00Z",
  },
  {
    id: "2",
    rollNumber: "002",
    name: "Sneha Sharma",
    email: "sneha@example.com",
    createdAt: "2026-01-12T12:00:00Z",
  },
  {
    id: "3",
    rollNumber: "003",
    name: "Rahul Verma",
    email: "rahul@example.com",
    createdAt: "2026-01-15T09:15:00Z",
  },
  {
    id: "4",
    rollNumber: "004",
    name: "Meghana Rao",
    email: "meghana@example.com",
    createdAt: "2026-01-18T14:45:00Z",
  },
];

const studentFormSchema = z.object({
  rollNumber: z.string().min(1, "Roll number is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function StudentsPage() {
  const [studentList, setStudentList] = useState<Student[]>(students);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
        onEdit: (student) => {
          setSelectedStudent(student);
          editForm.reset({
            rollNumber: student.rollNumber,
            name: student.name,
            email: student.email,
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

  function onCreate(values: StudentFormValues) {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      rollNumber: values.rollNumber,
      name: values.name,
      email: values.email,
      createdAt: new Date().toISOString(),
    };

    setStudentList((prev) => [newStudent, ...prev]);
    createForm.reset();
    setCreateOpen(false);
  }

  function onEdit(values: StudentFormValues) {
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
              <BreadcrumbPage>Students</BreadcrumbPage>
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

          <div className="gap-3 flex items-center">
            <Button variant={"outline"}>
              <HugeiconsIcon icon={Download01Icon} />
              Download
            </Button>
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
                  <DialogTitle>Create student</DialogTitle>
                  <DialogDescription>
                    Add basic student information.
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
            <SheetTitle>Edit student</SheetTitle>
            <SheetDescription>Update student information.</SheetDescription>
          </SheetHeader>
          <Form {...editForm}>
            <form
              className="space-y-3 px-4"
              onSubmit={editForm.handleSubmit(onEdit)}
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
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
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
