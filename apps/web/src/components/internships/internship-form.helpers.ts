
import { Internship, InternshipStoreBody } from "@/lib/api/generated/models";


export function internshipDefaults(internship?:Internship): InternshipStoreBody {
  return {
    from_date: internship?.from_date??new Date().toDateString(),
    to_date: internship?.to_date??new Date().toDateString(),
    industry_address: internship?.industry_address??"",
    industry_name:internship?.industry_name??"",
    role: internship?.role??"",
  };
}


