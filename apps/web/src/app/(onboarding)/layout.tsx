import { redirect } from "next/navigation";
import type React from "react";
import { getServerSessionUser } from "../../lib/auth/session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
