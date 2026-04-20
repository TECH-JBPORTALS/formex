import { z } from "zod";
import type { CourseOutcome } from "@/lib/api/generated/models";
import type { CourseOutcomeStoreBody } from "@/lib/api/generated/models/courseOutcomeStoreBody";
import type { CourseOutcomesUpdateBody } from "@/lib/api/generated/models/courseOutcomesUpdateBody";

export const CourseOutcomeFormSchema = z.object({
  name: z.string().max(255),
  description: z.string().nullable().optional(),
  syllabus_scheme: z.string().nullable().optional(),
});

export type CourseOutcomeFormValues = z.infer<typeof CourseOutcomeFormSchema>;

export function courseOutcomeCreateDefaults(): CourseOutcomeFormValues {
  return {
    name: "",
    description: "",
    syllabus_scheme: "",
  };
}

export function courseOutcomeToFormValues(
  outcome: CourseOutcome,
): CourseOutcomeFormValues {
  return {
    name: outcome.name,
    description: outcome.description ?? "",
    syllabus_scheme: outcome.syllabus_scheme ?? "",
  };
}

export function toCourseOutcomeStoreBody(
  values: CourseOutcomeFormValues,
): CourseOutcomeStoreBody {
  return values as CourseOutcomeStoreBody;
}

export function toCourseOutcomeUpdateBody(
  values: CourseOutcomeFormValues,
): CourseOutcomesUpdateBody {
  return values as CourseOutcomesUpdateBody;
}
