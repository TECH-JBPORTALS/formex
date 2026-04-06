
import { Placement, PlacementStoreBody } from "@/lib/api/generated/models";


export function placementDefaults(): PlacementStoreBody {
  return {
    industry_name: "",
    industry_address: "",
    role: "",
    ctc: "",
  };
}

export function placementToFormValues(
  row: Placement,
): PlacementStoreBody {
  return {
    industry_name: row.industry_name,
    industry_address: row.industry_address,
    role: row.role,
    ctc: row.ctc,
  };
}


