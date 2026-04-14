/**
 * klienta BetterAuth pro React komponenty
 * 
 * Použití:
 * import { authClient } from "@/lib/auth-client";
 * 
 * await authClient.signUp.email({ email, password, name });
 * await authClient.signIn.email({ email, password });
 * await authClient.signIn.passkey({ autoFill: true });
 */

'use client';

import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
                process.env.NEXT_PUBLIC_SITE_URL || 
                "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: baseURL,
  plugins: [
    passkeyClient(),
  ],
});
