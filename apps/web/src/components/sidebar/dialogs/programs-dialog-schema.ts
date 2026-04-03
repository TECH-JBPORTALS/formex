"use client";

import { z } from "zod";

export const programFormSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  short_name: z.string().min(1, "Required").max(50),
  intake: z.number().int().min(1, "At least 1"),
});

export type ProgramFormValues = z.infer<typeof programFormSchema>;

