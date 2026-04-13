"use client";

import type { ReactNode } from "react";
import { useSession } from "@/lib/api/hooks/useSession";
import { hasAnyRole } from "@/lib/auth/roles";

type ProtectProps = {
  allowedRoles: readonly string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function Protect({ allowedRoles, children, fallback = null }: ProtectProps) {
  const session = useSession();
  const role = session?.current_institution_role;

  if (!hasAnyRole(role, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
