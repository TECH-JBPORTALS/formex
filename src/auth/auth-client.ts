import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, principal, program_coordinator, staff } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        principal,
        program_coordinator,
        staff,
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
