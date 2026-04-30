"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Protect } from "@/components/auth/protect";
import Container from "@/components/container";
import { DataTable } from "@/components/data-table";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import { facultyInvitationStore } from "@/lib/api/generated/faculty-invitation/faculty-invitation";
import { FacultyInvitationStoreBody } from "@/lib/api/generated/faculty-invitation/faculty-invitation.zod";
import {
  facultyDestroy,
  facultyIndex,
  facultyStore,
  facultyUpdate,
} from "@/lib/api/generated/institution-faculty/institution-faculty";
import {
  FacultyIndexResponse,
  FacultyUpdateBody,
} from "@/lib/api/generated/institution-faculty/institution-faculty.zod";
import type { InstitutionFaculty } from "@/lib/api/generated/models";
import { useSession } from "@/lib/api/hooks/useSession";
import { canManageFaculty } from "@/lib/auth/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFacultyColumns } from "./columns";

const inviteFacultySchema = FacultyInvitationStoreBody;
type InviteFacultyValues = z.infer<typeof inviteFacultySchema>;

const editFacultySchema = FacultyUpdateBody.pick({
  role: true,
});
type EditFacultyValues = z.infer<typeof editFacultySchema>;

export default function Page() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      limitUrlUpdates: throttle(300),
    }),
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] =
    useState<InstitutionFaculty | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const session = useSession();
  const canManage = canManageFaculty(session?.current_institution_role);
  const queryClient = useQueryClient();

  const inviteForm = useForm<InviteFacultyValues>({
    resolver: zodResolver(inviteFacultySchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  });

  const editForm = useForm<EditFacultyValues>({
    resolver: zodResolver(editFacultySchema),
    defaultValues: {
      role: "course_coordinator",
    },
  });

  const facultyQuery = useQuery({
    queryKey: ["faculty-index"],
    enabled: canManage,
    queryFn: async (): Promise<InstitutionFaculty[]> => {
      const response = await facultyIndex();
      if (response.status !== 200) {
        throw new Error("Unable to load faculty.");
      }

      return FacultyIndexResponse.parse(response.data).data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteFacultyValues): Promise<void> => {
      await ensureSanctumCsrf();

      const response = await facultyInvitationStore(values);
      if (response.status !== 201) {
        throw new Error(
          response.data?.message ?? "Failed to send faculty invitation.",
        );
      }
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully.");
      setInviteOpen(false);
      inviteForm.reset();
      queryClient.invalidateQueries({ queryKey: ["faculty-index"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to send invitation.";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: EditFacultyValues): Promise<void> => {
      if (!selectedFaculty) {
        throw new Error("Faculty not selected.");
      }

      await ensureSanctumCsrf();

      const preservedProgramIds = selectedFaculty.programs.map(
        (program) => program.id,
      );
      const preservedSubjectIds = selectedFaculty.subjects.map(
        (subject) => subject.id,
      );

      const response = await facultyUpdate(selectedFaculty.id, {
        role: values.role,
        program_ids:
          values.role === "program_coordinator" ? preservedProgramIds : [],
        subject_ids:
          values.role === "course_coordinator" ? preservedSubjectIds : [],
      });

      if (response.status !== 200) {
        throw new Error(response.data?.message ?? "Failed to update faculty.");
      }
    },
    onSuccess: () => {
      toast.success("Faculty updated successfully.");
      setEditOpen(false);
      setSelectedFaculty(null);
      queryClient.invalidateQueries({ queryKey: ["faculty-index"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to update faculty.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!selectedFaculty) {
        throw new Error("Faculty not selected.");
      }

      await ensureSanctumCsrf();

      const response = await facultyDestroy(selectedFaculty.id);
      if (response.status !== 200) {
        throw new Error(response.data?.message ?? "Failed to delete faculty.");
      }
    },
    onSuccess: () => {
      toast.success("Faculty moved to inactive.");
      setDeleteOpen(false);
      setSelectedFaculty(null);
      queryClient.invalidateQueries({ queryKey: ["faculty-index"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete faculty.";
      toast.error(message);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (faculty: InstitutionFaculty): Promise<void> => {
      await ensureSanctumCsrf();
      const response = await facultyStore({
        user_id: faculty.id,
        role:
          faculty.role === "program_coordinator"
            ? "program_coordinator"
            : "course_coordinator",
        program_ids: faculty.programs.map((program) => program.id),
        subject_ids: faculty.subjects.map((subject) => subject.id),
      });
      if (response.status !== 201) {
        throw new Error(response.data?.message ?? "Failed to reactivate faculty.");
      }
    },
    onSuccess: () => {
      toast.success("Faculty reactivated successfully.");
      queryClient.invalidateQueries({ queryKey: ["faculty-index"] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to reactivate faculty.";
      toast.error(message);
    },
  });

  const columns = useMemo(
    () =>
      getFacultyColumns({
        canManage,
        onEdit: (faculty) => {
          setSelectedFaculty(faculty);
          editForm.reset({
            role:
              faculty.role === "program_coordinator"
                ? "program_coordinator"
                : "course_coordinator",
          });
          setEditOpen(true);
        },
        onDelete: (faculty) => {
          setSelectedFaculty(faculty);
          setDeleteOpen(true);
        },
        onReactivate: (faculty) => {
          reactivateMutation.mutate(faculty);
        },
      }),
    [canManage, editForm, reactivateMutation],
  );

  const faculty = facultyQuery.data ?? [];
  const filteredFaculty = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return faculty;
    }

    return faculty.filter((row) => {
      const haystack = [
        row.name,
        row.email,
        row.role,
        ...row.programs.map((program) => program.name),
        ...row.subjects.map((subject) => subject.name),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [faculty, search]);
  const activeFaculty = useMemo(
    () => filteredFaculty.filter((row) => row.is_active),
    [filteredFaculty],
  );
  const inactiveFaculty = useMemo(
    () => filteredFaculty.filter((row) => !row.is_active),
    [filteredFaculty],
  );

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbPage>Faculty</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>
      <Container>
        <Protect
          allowedRoles={["principal"]}
          fallback={
            <div className="rounded-xl border p-4 text-sm text-muted-foreground">
              You do not have access to manage faculty.
            </div>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <InputGroup className="max-w-sm min-w-[200px]">
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search faculty..."
                value={search}
                onChange={(e) => void setSearch(e.target.value || null)}
              />
            </InputGroup>

            <Dialog
              open={inviteOpen}
              onOpenChange={(open) => {
                setInviteOpen(open);
                if (!open) {
                  inviteForm.reset();
                }
              }}
            >
              <Button onClick={() => setInviteOpen(true)}>
                Invite Faculty <HugeiconsIcon icon={PlusSignIcon} />
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite faculty</DialogTitle>
                  <DialogDescription>
                    Send an invite email with signup link.
                  </DialogDescription>
                </DialogHeader>
                <Form {...inviteForm}>
                  <form
                    className="space-y-3"
                    onSubmit={inviteForm.handleSubmit((values) =>
                      inviteMutation.mutate(values),
                    )}
                  >
                    <FormField
                      control={inviteForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inviteForm.control}
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
                        onClick={() => setInviteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={inviteMutation.isPending}>
                        {inviteMutation.isPending
                          ? "Sending..."
                          : "Send Invite"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {facultyQuery.isLoading ? (
            <SpinnerPage />
          ) : facultyQuery.isError ? (
            <div className="rounded-xl border p-4 text-sm text-destructive">
              Failed to load faculty data.
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">
                  Active ({activeFaculty.length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive ({inactiveFaculty.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <DataTable columns={columns} data={activeFaculty} />
              </TabsContent>
              <TabsContent value="inactive">
                <DataTable columns={columns} data={inactiveFaculty} />
              </TabsContent>
            </Tabs>
          )}
        </Protect>

        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) {
              setSelectedFaculty(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit faculty</DialogTitle>
              <DialogDescription>
                Update coordinator role. Existing assignments are kept.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                className="space-y-3"
                onSubmit={editForm.handleSubmit((values) =>
                  updateMutation.mutate(values),
                )}
              >
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="course_coordinator">
                            Course Coordinator
                          </SelectItem>
                          <SelectItem value="program_coordinator">
                            Program Coordinator
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) {
              setSelectedFaculty(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate faculty</DialogTitle>
              <DialogDescription>
                {selectedFaculty
                  ? `Move ${selectedFaculty.name} to inactive staff?`
                  : "Move this faculty member to inactive staff?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Removing..." : "Move to Inactive"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}
