import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const principal = ac.newRole({
  project: ["create", "delete", "share", "update"],
  ...adminAc.statements,
});

export const program_coordinator = ac.newRole({
  project: ["create", "delete", "share", "update"],
});

export const staff = ac.newRole({
  project: ["create", "delete", "share", "update"],
});
