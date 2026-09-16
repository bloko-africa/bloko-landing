import {
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { authorizationClient } from "./modules/authorization";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    ...authorizationClient,
    magicLinkClient(),
    emailOTPClient(),
  ],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
