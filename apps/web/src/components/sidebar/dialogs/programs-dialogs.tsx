"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import type { UseFormReturn } from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { LoaderCircle } from "@hugeicons/core-free-icons";

import type { ProgramFormValues } from "./programs-dialog-schema";
import type { Program } from "@/lib/api/generated/models/program";

function ProgramFormFields({
  form,
}: {
  form: UseFormReturn<ProgramFormValues>;
}) {
  return (
    <>
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
        name="short_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="intake"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Intake</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.valueAsNumber || e.target.value)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

function SubmitButtonContent({
  label,
  isSubmitting,
}: {
  label: string;
  isSubmitting: boolean;
}) {
  return isSubmitting ? (
    <>
      <HugeiconsIcon
        icon={LoaderCircle}
        className="mr-2 h-4 w-4 animate-spin"
      />
      Saving…
    </>
  ) : (
    label
  );
}

export function CreateProgramDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ProgramFormValues>;
  onSubmit: (values: ProgramFormValues) => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New program</DialogTitle>
          <DialogDescription>
            Adds a program to this institution.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((v) => onSubmit(v))}
          >
            <ProgramFormFields form={form} />
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <SubmitButtonContent
                  label="Create"
                  isSubmitting={form.formState.isSubmitting}
                />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditProgramDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ProgramFormValues>;
  onSubmit: (values: ProgramFormValues) => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit program</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit((v) => onSubmit(v))}
          >
            <ProgramFormFields form={form} />
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <SubmitButtonContent
                  label="Save"
                  isSubmitting={form.formState.isSubmitting}
                />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteProgramDialog({
  open,
  onOpenChange,
  program,
  busy,
  onConfirmDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
  busy: boolean;
  onConfirmDelete: () => void | Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete program?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{program?.name}</strong> and related data may be affected.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              void onConfirmDelete();
            }}
          >
            {busy ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
