import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/auth/session";
import { CreateInstitutionForm } from "./create-institution-form";

export const metadata = {
  title: "Create institution · Formex",
};

export default async function NewInstitutionPage() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect("/sign-in");
  }

  if (user.institutions.length > 0) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted to-background flex items-center justify-center px-4 py-10">
      <CreateInstitutionForm />
    </div>
  );
}
