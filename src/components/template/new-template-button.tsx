"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";

export default function NewTemplateButton() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: createNewTemplate, isPending } = useMutation(
    trpc.template.new.mutationOptions({
      async onSuccess(data) {
        if (data.id) router.push(`/doc/${data.id}`);
        await queryClient.invalidateQueries(trpc.template.pathFilter());
      },
      onError(error) {
        toast.error(error.message);
      },
    }),
  );
  return (
    <Button disabled={isPending} onClick={() => createNewTemplate()}>
      {isPending ? (
        "Creating..."
      ) : (
        <>
          New Template
          <PlusIcon />
        </>
      )}
    </Button>
  );
}
