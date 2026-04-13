import { redirect } from "next/navigation";
import type React from "react";
import { getServerSessionUser } from "../../lib/auth/session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();

  if (user) {
    redirect("/");
  }

  return <>{children}</>;
}
