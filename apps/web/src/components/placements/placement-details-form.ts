import { z } from "zod";
import type {
  Placement,
  PlacementStoreBody,
  PlacementsUpdateBody,
} from "@/lib/api/generated/models";

export const placementDetailsSchema = z.object({
  industry_name: z.string().min(1).max(255),
  industry_address: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  ctc: z.string().min(1).max(255),
});

export type PlacementDetailsFormValues = z.infer<typeof placementDetailsSchema>;

export function placementDetailsDefaults(): PlacementDetailsFormValues {
  return {
    industry_name: "",
    industry_address: "",
    role: "",
    ctc: "",
  };
}

export function placementToFormValues(
  row: Placement,
): PlacementDetailsFormValues {
  return {
    industry_name: row.industry_name,
    industry_address: row.industry_address,
    role: row.role,
    ctc: row.ctc,
  };
}

export function toPlacementStoreBody(
  values: PlacementDetailsFormValues,
): PlacementStoreBody {
  return values;
}

export function toPlacementsUpdateBody(
  values: PlacementDetailsFormValues,
): PlacementsUpdateBody {
  return values;
}
