/**
 * BetterAuth konfigurace pro Plexus
 * 
 * Podporuje:
 * - Email + Password autentizaci
 * - Passkey autentizaci (WebAuthn)
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { randomUUID } from "crypto";
import { db } from "./db";
import * as schema from "./schema";
import { sendEmailWithPlunk } from "@/lib/services/emailService";

const baseURL = process.env.BETTER_AUTH_URL || process.env.SITE_URL || "http://localhost:3000";
const origin = baseURL.replace(/\/$/, ""); // Odstranit trailing slash

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  user: {
    additionalFields: {
      surname: {
        type: "string",
        required: false,
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
    },
  },
  advanced: {
    database: {
      generateId: () => {
        return randomUUID();
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const nameParts = (user.name || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const surname = nameParts.slice(1).join(" ") || firstName;

          return {
            data: {
              ...user,
              name: firstName,
              surname: surname,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url, token }, request) => {
      const htmlBody = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charSet="UTF-8" />
    <title>Obnovení hesla - Plexus</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;">
            <tr>
              <td style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111827;">Obnovení hesla - Plexus</h1>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">Dobrý den,</p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  obdrželi jsme požadavek na obnovení hesla k&nbsp;vašemu účtu v Plexus.
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Pokud jste požadavek zadali vy, pokračujte kliknutím na následující tlačítko:
                </p>
                <p style="margin:0 0 24px;">
                  <a
                    href="${url}"
                    style="display:inline-block;padding:10px 18px;border-radius:9999px;background-color:#111827;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;"
                  >
                    Obnovit heslo
                  </a>
                </p>
                <p style="margin:0 0 16px;font-size:13px;color:#4b5563;">
                  Pokud tlačítko nefunguje, můžete použít následující odkaz:
                </p>
                <p style="margin:0 0 24px;font-size:12px;color:#4b5563;word-break:break-all;">
                  <a href="${url}" style="color:#111827;">${url}</a>
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Pokud jste obnovu hesla nevyžádali, můžete tento email ignorovat. Vaše heslo zůstane beze změny.
                </p>
                <p style="margin:0;font-size:14px;color:#111827;">
                  S pozdravem,<br />tým Plexus
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      await sendEmailWithPlunk({
        to: user.email,
        subject: "Obnovení hesla pro váš Plexus účet",
        body: htmlBody,
      });
    },
    onPasswordReset: async ({ user }, request) => {},
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const htmlBody = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charSet="UTF-8" />
    <title>Ověření emailové adresy - Plexus</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;">
            <tr>
              <td style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111827;">Ověření emailové adresy - Plexus</h1>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">Dobrý den,</p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  děkujeme za registraci v Plexus. Pro dokončení nastavení účtu prosím ověřte svou emailovou adresu kliknutím na následující tlačítko:
                </p>
                <p style="margin:0 0 24px;">
                  <a
                    href="${url}"
                    style="display:inline-block;padding:10px 18px;border-radius:9999px;background-color:#111827;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;"
                  >
                    Ověřit email
                  </a>
                </p>
                <p style="margin:0 0 16px;font-size:13px;color:#4b5563;">
                  Pokud tlačítko nefunguje, můžete použít následující odkaz:
                </p>
                <p style="margin:0 0 24px;font-size:12px;color:#4b5563;word-break:break-all;">
                  <a href="${url}" style="color:#111827;">${url}</a>
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Pokud jste se v Plexus neregistrovali vy, můžete tento email ignorovat.
                </p>
                <p style="margin:0;font-size:14px;color:#111827;">
                  S pozdravem,<br />tým Plexus
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      await sendEmailWithPlunk({
        to: user.email,
        subject: "Ověření emailové adresy pro Plexus",
        body: htmlBody,
      });
    },
  },
  plugins: [
    passkey({
      rpID: process.env.NODE_ENV === "production" 
        ? new URL(baseURL).hostname 
        : "localhost",
      rpName: "Plexus",
      origin: origin,
    }),
  ],
  baseURL: baseURL,
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production-min-32-chars-required",
  basePath: "/api/auth",
});

/**
 * Typy pro TypeScript
 */
export type Session = typeof auth.$Infer.Session;
