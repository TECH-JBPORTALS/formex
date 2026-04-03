"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/header";
import { getFacultyColumns, type Faculty } from "./columns";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const facultyList: Faculty[] = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    email: "rajesh@example.com",
    role: "hod",
    branch: "CSE",
    createdAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "2",
    name: "Anita Sharma",
    email: "anita@example.com",
    role: "staff",
    createdAt: "2026-01-08T11:30:00Z",
  },
  {
    id: "3",
    name: "Vikram Reddy",
    email: "vikram@example.com",
    role: "staff",
    createdAt: "2026-01-12T14:20:00Z",
  },
  {
    id: "4",
    name: "Dr. Meena Iyer",
    email: "meena@example.com",
    role: "hod",
    branch: "ECE",
    createdAt: "2026-01-15T10:10:00Z",
  },
];

const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL"] as const;

const facultyFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["staff", "hod"]),
    branch: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.role === "hod" && !values.branch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["branch"],
        message: "Branch is required for HOD",
      });
    }
  });

type FacultyFormValues = z.infer<typeof facultyFormSchema>;

export default function Page() {
  const [faculty, setFaculty] = useState<Faculty[]>(facultyList);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const createForm = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: { name: "", email: "", role: "staff", branch: "" },
  });
  const createRole = createForm.watch("role");

  const editForm = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: { name: "", email: "", role: "staff", branch: "" },
  });
  const editRole = editForm.watch("role");

  const columns = useMemo(
    () =>
      getFacultyColumns({
        onEdit: (item) => {
          setSelectedFaculty(item);
          editForm.reset({
            name: item.name,
            email: item.email,
            role: item.role,
            branch: item.branch ?? "",
          });
          setEditOpen(true);
        },
        onDelete: (item) => {
          setSelectedFaculty(item);
          setDeleteOpen(true);
        },
      }),
    [editForm],
  );

  function onCreate(values: FacultyFormValues) {
    const next: Faculty = {
      id: crypto.randomUUID(),
      name: values.name,
      email: values.email,
      role: values.role,
      branch: values.role === "hod" ? values.branch : undefined,
      createdAt: new Date().toISOString(),
    };

    setFaculty((prev) => [next, ...prev]);
    createForm.reset({ name: "", email: "", role: "staff", branch: "" });
    setCreateOpen(false);
  }

  function onEdit(values: FacultyFormValues) {
    if (!selectedFaculty) return;

    setFaculty((prev) =>
      prev.map((item) =>
        item.id === selectedFaculty.id
          ? {
              ...item,
              name: values.name,
              email: values.email,
              role: values.role,
              branch: values.role === "hod" ? values.branch : undefined,
            }
          : item,
      ),
    );
    setEditOpen(false);
    setSelectedFaculty(null);
  }

  function onDelete() {
    if (!selectedFaculty) return;

    setFaculty((prev) => prev.filter((item) => item.id !== selectedFaculty.id));
    setDeleteOpen(false);
    setSelectedFaculty(null);
  }

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbPage>Faculty</BreadcrumbPage>
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
              if (!open) {
                createForm.reset({
                  name: "",
                  email: "",
                  role: "staff",
                  branch: "",
                });
              }
            }}
          >
            <Button onClick={() => setCreateOpen(true)}>
              Add <HugeiconsIcon icon={PlusSignIcon} />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create faculty</DialogTitle>
                <DialogDescription>
                  Add faculty details. Default role is staff.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form
                  className="space-y-3"
                  onSubmit={createForm.handleSubmit(onCreate)}
                >
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
                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== "hod") {
                              createForm.setValue("branch", "");
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="hod">HOD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {createRole === "hod" && (
                    <FormField
                      control={createForm.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem key={branch} value={branch}>
                                  {branch}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
        <DataTable columns={columns} data={faculty} />
      </Container>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedFaculty(null);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit faculty</SheetTitle>
            <SheetDescription>Update faculty information.</SheetDescription>
          </SheetHeader>
          <Form {...editForm}>
            <form
              className="space-y-3 px-4"
              onSubmit={editForm.handleSubmit(onEdit)}
            >
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
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "hod") {
                          editForm.setValue("branch", "");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="hod">HOD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editRole === "hod" && (
                <FormField
                  control={editForm.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
            <AlertDialogTitle>Delete faculty?</AlertDialogTitle>
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
