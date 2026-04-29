"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  getCourseOutcomesIndexQueryKey,
  getCourseOutcomeListByCourseQueryKey,
  useCourseOutcomeStore,
} from "@/lib/api/generated/course-outcome/course-outcome";
import {
  courseOutcomeCreateDefaults,
  CourseOutcomeFormSchema,
  type CourseOutcomeFormValues,
  toCourseOutcomeStoreBody,
} from "./course-outcome-form.helpers";

export function CreateCourseOutcomeSheet({
  children,
  subjectId,
}: {
  children: ReactNode;
  subjectId: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<CourseOutcomeFormValues>({
    resolver: zodResolver(CourseOutcomeFormSchema),
    defaultValues: courseOutcomeCreateDefaults(),
  });

  const storeMutation = useCourseOutcomeStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status >= 400) {
            toast.error("Could not create course outcome");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getCourseOutcomesIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getCourseOutcomeListByCourseQueryKey(subjectId),
          });
          toast.success("Course outcome created");
          setOpen(false);
          form.reset(courseOutcomeCreateDefaults());
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create course outcome",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: CourseOutcomeFormValues) {
    await storeMutation.mutateAsync({
      subject: subjectId,
      data: toCourseOutcomeStoreBody(CourseOutcomeFormSchema.parse(values)),
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset(courseOutcomeCreateDefaults());
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New course outcome</SheetTitle>
          <SheetDescription>Create an outcome entry for this subject.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="create-course-outcome-form"
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
                    <Input placeholder="Course outcome name" {...field} />
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
                    <Input placeholder="C25 / R22 / etc." {...field} value={field.value ?? ""} />
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
                      placeholder="60"
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
                    <Textarea rows={4} placeholder="Description" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-4 py-4 sm:flex-row">
            <Button
              type="submit"
              form="create-course-outcome-form"
              disabled={storeMutation.isPending}
            >
              {storeMutation.isPending ? "Saving..." : "Save course outcome"}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
