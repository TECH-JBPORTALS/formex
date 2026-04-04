import { z } from "zod";
import type {
  Internship,
  InternshipStoreBody,
  InternshipsUpdateBody,
} from "@/lib/api/generated/models";

export const internshipFieldsSchema = z.object({
  industry_name: z.string().min(1).max(255),
  industry_address: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  from_date: z.string().min(1),
  to_date: z.string().min(1),
  semester: z.number().min(1).max(6),
  acad_year: z.number().min(2000),
});

export type InternshipFieldsFormValues = z.infer<typeof internshipFieldsSchema>;

export function internshipFieldsDefaults(): InternshipFieldsFormValues {
  return {
    industry_name: "",
    industry_address: "",
    role: "",
    from_date: "",
    to_date: "",
    semester: 1,
    acad_year: new Date().getFullYear(),
  };
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function internshipToFormValues(
  row: Internship,
): InternshipFieldsFormValues {
  return {
    industry_name: row.industry_name,
    industry_address: row.industry_address,
    role: row.role,
    from_date: toDatetimeLocalValue(row.from_date),
    to_date: toDatetimeLocalValue(row.to_date),
    semester: row.semester,
    acad_year: row.acad_year,
  };
}

export function toInternshipStoreBody(
  values: InternshipFieldsFormValues,
): InternshipStoreBody {
  return {
    industry_name: values.industry_name,
    industry_address: values.industry_address,
    role: values.role,
    from_date: new Date(values.from_date).toISOString(),
    to_date: new Date(values.to_date).toISOString(),
    semester: values.semester,
    acad_year: values.acad_year,
  };
}

export function toInternshipsUpdateBody(
  values: InternshipFieldsFormValues,
): InternshipsUpdateBody {
  return toInternshipStoreBody(values);
}
