"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const newSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
});

export type NewSubjectValues = z.infer<typeof newSubjectSchema>;

type NewSubjectDialogProps = {
  trigger?: ReactNode;
  onCreated?: (values: NewSubjectValues) => void;
};

export function NewSubjectDialog({
  trigger,
  onCreated,
}: NewSubjectDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<NewSubjectValues>({
    resolver: zodResolver(newSubjectSchema),
    defaultValues: { name: "", subjectCode: "" },
  });

  function onSubmit(values: NewSubjectValues) {
    onCreated?.(values);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>New Subject</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create subject</DialogTitle>
          <DialogDescription>
            Enter subject name and subject code.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
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
              name="subjectCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject code</FormLabel>
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
