"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Subject } from "@/lib/api/generated/models";
import {
  getSubjectListbysemesterQueryKey,
  useSubjectsUpdate,
} from "@/lib/api/generated/subject/subject";

const EditSubjectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  short_name: z.string().min(1, "Short name is required").max(10),
  code: z.string().min(1, "Code is required").max(50),
  type: z.enum(["theory", "practical"]),
  scheme: z.string().min(1, "Scheme is required").max(50),
});
type EditSubjectFormValues = z.infer<typeof EditSubjectFormSchema>;

function subjectToFormValues(subject: Subject): EditSubjectFormValues {
  const type =
    subject.type === "practical" || subject.type === "theory"
      ? subject.type
      : "theory";
  return {
    name: subject.name,
    short_name: subject.short_name,
    code: subject.code ?? subject.short_name,
    type,
    scheme: subject.scheme ?? "",
  };
}

export function EditSubjectDialog({
  subject,
  programId,
  listSemester,
  open,
  onOpenChange,
}: {
  subject: Subject;
  programId: string;
  /** Semester used for the subjects list query (URL); invalidate this cache on success. */
  listSemester: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(EditSubjectFormSchema),
    defaultValues: subjectToFormValues(subject),
  });

  useEffect(() => {
    if (open) {
      form.reset(subjectToFormValues(subject));
    }
  }, [open, subject, form]);

  const updateMutation = useSubjectsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update subject");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getSubjectListbysemesterQueryKey(programId, listSemester),
          });
          if (subject.semester !== listSemester) {
            await queryClient.invalidateQueries({
              queryKey: getSubjectListbysemesterQueryKey(
                programId,
                subject.semester,
              ),
            });
          }
          toast.success("Subject updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not update subject",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: EditSubjectFormValues) {
    await updateMutation.mutateAsync({
      subject: subject.id,
      data: { ...values, semester: subject.semester },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit subject</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="edit-subject-form"
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
              Assigned to semester {subject.semester}. The table shows subjects
              for the semester selected in the program sidebar.
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
            form="edit-subject-form"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
