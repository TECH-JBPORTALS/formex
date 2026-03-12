"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

type StudentRow = {
  id: string;
  fullName: string;
  dateOfBirth: string | Date;
  createdAt: string | Date;
};

export function StudentTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFullName, setCreateFullName] = useState("");
  const [createDob, setCreateDob] = useState("");

  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editDob, setEditDob] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: students, isLoading } = useQuery(
    trpc.student.list.queryOptions(),
  );

  const createMutation = useMutation(
    trpc.student.create.mutationOptions({
      async onSuccess() {
        setCreateFullName("");
        setCreateDob("");
        setIsCreateOpen(false);
        await queryClient.invalidateQueries(trpc.student.pathFilter());
        toast.success("Student created");
      },
      onError(error) {
        toast.error(error.message);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.student.update.mutationOptions({
      async onSuccess() {
        setEditingStudent(null);
        await queryClient.invalidateQueries(trpc.student.pathFilter());
        toast.success("Student updated");
      },
      onError(error) {
        toast.error(error.message);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.student.delete.mutationOptions({
      async onSuccess() {
        setDeleteId(null);
        await queryClient.invalidateQueries(trpc.student.pathFilter());
        toast.success("Student deleted");
      },
      onError(error) {
        toast.error(error.message);
      },
    }),
  );

  const openCreateDialog = () => {
    setIsCreateOpen(true);
    setCreateFullName("");
    setCreateDob("");
  };

  const handleCreate = () => {
    if (!createFullName || !createDob) {
      toast.error("Full name and date of birth are required");
      return;
    }
    createMutation.mutate({
      fullName: createFullName,
      dateOfBirth: createDob,
    });
  };

  const openEditDialog = (s: StudentRow) => {
    const dob =
      typeof s.dateOfBirth === "string"
        ? new Date(s.dateOfBirth)
        : s.dateOfBirth;
    setEditingStudent(s);
    setEditFullName(s.fullName);
    setEditDob(format(dob, "yyyy-MM-dd"));
  };

  const handleUpdate = () => {
    if (!editingStudent || !editFullName || !editDob) {
      toast.error("Full name and date of birth are required");
      return;
    }
    updateMutation.mutate({
      id: editingStudent.id,
      fullName: editFullName,
      dateOfBirth: editDob,
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ id: deleteId });
  };

  return (
    <>
      <Card className="max-w-5xl mx-auto mt-10">
        <CardHeader className="border-b">
          <CardTitle>Students</CardTitle>
          <CardDescription>
            Manage your student records with a clean table and dialogs.
          </CardDescription>
          <CardAction>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="mr-1 h-4 w-4" />
              New student
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="overflow-x-auto rounded-md border bg-card">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold">Full name</th>
                  <th className="px-4 py-2 font-semibold">Date of birth</th>
                  <th className="px-4 py-2 font-semibold">Created at</th>
                  <th className="px-4 py-2 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-center" colSpan={4}>
                      Loading students...
                    </td>
                  </tr>
                ) : !students || students.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      No students yet. Click &quot;New student&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  students.map((s: StudentRow) => {
                    const dob =
                      typeof s.dateOfBirth === "string"
                        ? new Date(s.dateOfBirth)
                        : s.dateOfBirth;
                    const createdAt =
                      typeof s.createdAt === "string"
                        ? new Date(s.createdAt)
                        : s.createdAt;

                    return (
                      <tr key={s.id} className="border-t">
                        <td className="px-4 py-2 align-middle">{s.fullName}</td>
                        <td className="px-4 py-2 align-middle">
                          {format(dob, "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-2 align-middle text-muted-foreground">
                          {format(createdAt, "dd MMM yyyy")}
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              onClick={() => openEditDialog(s)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={deleteId === s.id}
                              onOpenChange={(open) =>
                                setDeleteId(open ? s.id : null)
                              }
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New student</DialogTitle>
            <DialogDescription>
              Create a new student record. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="create-full-name">
                Full name
              </label>
              <Input
                id="create-full-name"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="create-dob">
                Date of birth
              </label>
              <Input
                id="create-dob"
                type="date"
                value={createDob}
                onChange={(e) => setCreateDob(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              type="button"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingStudent}
        onOpenChange={(open) => !open && setEditingStudent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>
              Update the student details and save your changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-full-name">
                Full name
              </label>
              <Input
                id="edit-full-name"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-dob">
                Date of birth
              </label>
              <Input
                id="edit-dob"
                type="date"
                value={editDob}
                onChange={(e) => setEditDob(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingStudent(null)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              type="button"
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              student record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
