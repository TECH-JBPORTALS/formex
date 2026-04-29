"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { CourseOutcome } from "@/lib/api/generated/models";
import {
  getCourseOutcomesIndexQueryKey,
  getCourseOutcomeListByCourseQueryKey,
  useCourseOutcomesUpdate,
} from "@/lib/api/generated/course-outcome/course-outcome";
import {
  courseOutcomeToFormValues,
  CourseOutcomeFormSchema,
  type CourseOutcomeFormValues,
  toCourseOutcomeUpdateBody,
} from "./course-outcome-form.helpers";

export function EditCourseOutcomeSheet({
  courseOutcome,
  open,
  onOpenChange,
}: {
  courseOutcome: CourseOutcome;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<CourseOutcomeFormValues>({
    resolver: zodResolver(CourseOutcomeFormSchema),
    values: courseOutcomeToFormValues(courseOutcome),
  });

  const updateMutation = useCourseOutcomesUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update course outcome");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getCourseOutcomesIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getCourseOutcomeListByCourseQueryKey(
              courseOutcome.course_id,
            ),
          });
          toast.success("Course outcome updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not update course outcome",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: CourseOutcomeFormValues) {
    await updateMutation.mutateAsync({
      courseOutcome: courseOutcome.id,
      data: toCourseOutcomeUpdateBody(CourseOutcomeFormSchema.parse(values)),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit course outcome</SheetTitle>
          <SheetDescription>
            {courseOutcome.course?.name ?? "Course"}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="edit-course-outcome-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
          >
            <FormField
              control={form.control}
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
              control={form.control}
              name="syllabus_scheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Syllabus Scheme</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Percentage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={field.value}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        field.onChange(Number.isNaN(next) ? 0 : next);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-4 py-4 sm:flex-row">
            <Button
              type="submit"
              form="edit-course-outcome-form"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
