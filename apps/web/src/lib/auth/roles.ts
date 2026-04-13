export type InstitutionRole =
  | "principal"
  | "program_coordinator"
  | "course_coordinator"
  | string;

export function hasAnyRole(
  role: string | null | undefined,
  allowedRoles: readonly string[],
): boolean {
  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
}

export function canManageFaculty(role: string | null | undefined): boolean {
  return hasAnyRole(role, ["principal"]);
}

export function canAccessProgramSidebar(
  role: string | null | undefined,
): boolean {
  return hasAnyRole(role, [
    "principal",
    "program_coordinator",
    "course_coordinator",
  ]);
}
