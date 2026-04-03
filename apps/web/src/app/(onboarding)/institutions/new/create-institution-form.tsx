"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { institutionsStore } from "@/lib/api/generated/institution/institution";
import { InstitutionsStoreBodyType } from "@/lib/api/generated/models/institutionsStoreBodyType";
import type { ValidationExceptionResponse } from "@/lib/api/generated/models/validationExceptionResponse";

const institutionTypes = [
  InstitutionsStoreBodyType.government,
  InstitutionsStoreBodyType.aided,
  InstitutionsStoreBodyType.private,
] as const;

const createInstitutionSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  code: z.string().min(1, "Required").max(255),
  address: z.string().min(1, "Required"),
  type: z.enum(institutionTypes),
});

export type CreateInstitutionFormValues = z.infer<
  typeof createInstitutionSchema
>;

export function CreateInstitutionForm() {
  const router = useRouter();

  const form = useForm<CreateInstitutionFormValues>({
    resolver: zodResolver(createInstitutionSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      type: InstitutionsStoreBodyType.private,
    },
  });

  async function onSubmit(values: CreateInstitutionFormValues) {
    const res = await institutionsStore({
      name: values.name,
      code: values.code,
      address: values.address,
      type: values.type,
    });

    if (res.status === 201) {
      toast.success("Institution created");
      router.push("/");
      router.refresh();
      return;
    }

    if (res.status === 422 && res.data && isValidationError(res.data)) {
      const { message, errors } = res.data;
      for (const [key, messages] of Object.entries(errors)) {
        if (!Array.isArray(messages) || !messages[0]) {
          continue;
        }
        form.setError(key as keyof CreateInstitutionFormValues, {
          message: messages[0],
        });
      }
      toast.error(message);
      return;
    }

    toast.error("Could not create institution. Try again.");
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-border/60 backdrop-blur-sm bg-background/80">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-mono font-semibold tracking-tight">
            Create your institution
          </CardTitle>
          <CardDescription>
            Add your college or institution to continue with Formex.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="organization" />
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
                    <FormLabel>Institution code</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value={InstitutionsStoreBodyType.government}
                        >
                          Government
                        </SelectItem>
                        <SelectItem value={InstitutionsStoreBodyType.aided}>
                          Aided
                        </SelectItem>
                        <SelectItem value={InstitutionsStoreBodyType.private}>
                          Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create institution"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function isValidationError(data: unknown): data is ValidationExceptionResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "errors" in data &&
    typeof (data as ValidationExceptionResponse).message === "string" &&
    typeof (data as ValidationExceptionResponse).errors === "object" &&
    (data as ValidationExceptionResponse).errors !== null
  );
}
