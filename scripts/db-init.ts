import * as dotenv from "dotenv";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

/**
 * Inicializace databáze pro lokální/dev prostředí.
 *
 * Co skript dělá:
 * - spustí `drizzle-kit push` (vytvoří/aktualizuje tabulky podle `src/lib/schema.ts`)
 * - založí výchozí role (superadmin/admin/user)
 * - založí 1 superadmin uživatele a přiřadí mu roli `superadmin`
 *
 * Konfigurace přes ENV:
 * - DATABASE_URL (povinné)
 * - SUPERADMIN_EMAIL (default: admin@plexus.local)
 * - SUPERADMIN_PASSWORD (default: PlexusAdmin123!; použije se jen pokud se podaří korektně zahashovat)
 * - SUPERADMIN_NAME (default: "Super Admin")
 */

type SeedRole = {
  name: string;
  color: string;
  weight: number;
  permissions?: bigint;
};

function loadEnv() {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

function runDrizzlePush() {
  execSync("pnpm drizzle-kit push", { stdio: "inherit" });
}

async function ensureRole(params: {
  db: any;
  schema: any;
  role: SeedRole;
}) {
  const { db, schema, role } = params;
  const existing = await db
    .select()
    .from(schema.roleDefinitions)
    .where(eq(schema.roleDefinitions.name, role.name))
    .limit(1);

  if (existing[0]) return existing[0];

  const inserted = await db
    .insert(schema.roleDefinitions)
    .values({
      id: randomUUID(),
      name: role.name,
      color: role.color,
      weight: role.weight,
      permissions: role.permissions ?? BigInt(0),
    })
    .returning();

  return inserted[0]!;
}

async function ensureUserByEmail(params: {
  db: any;
  schema: any;
  email: string;
  name: string;
  surname: string;
}) {
  const { db, schema } = params;
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, params.email))
    .limit(1);

  if (existing[0]) return existing[0];

  const inserted = await db
    .insert(schema.users)
    .values({
      id: randomUUID(),
      email: params.email,
      name: params.name,
      surname: params.surname,
      emailVerified: true,
      bio: "",
    })
    .returning();

  return inserted[0]!;
}

async function tryCreateCredentialAccount(params: {
  db: any;
  schema: any;
  userId: string;
  password: string;
}) {
  const { db, schema } = params;
  const existing = await db
    .select()
    .from(schema.account)
    .where(eq(schema.account.userId, params.userId))
    .limit(1);

  if (existing[0]) return { created: false, reason: "exists" as const };

  let hashedPassword: string | null = null;

  try {
    const maybeCrypto = (await import("better-auth/crypto")) as any;
    if (typeof maybeCrypto.hashPassword === "function") {
      hashedPassword = await maybeCrypto.hashPassword(params.password);
    }
  } catch {
    // Ignorujeme – v některých verzích Better Auth nemusí být helper dostupný jako veřejný export.
  }

  if (!hashedPassword) {
    return { created: false, reason: "hash_unavailable" as const };
  }

  await db.insert(schema.account).values({
    id: randomUUID(),
    userId: params.userId,
    providerId: "credential",
    accountId: params.userId,
    password: hashedPassword,
  });

  return { created: true as const };
}

async function ensureUserRole(params: {
  db: any;
  schema: any;
  userId: string;
  roleId: string;
}) {
  const { db, schema } = params;
  await db
    .insert(schema.userToRoles)
    .values({ userId: params.userId, roleId: params.roleId })
    .onConflictDoNothing();
}

async function main() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const [{ db }, schema] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/schema"),
  ]);

  console.log("→ Spouštím drizzle schema push…");
  runDrizzlePush();

  console.log("→ Zakládám výchozí role…");
  const superadminRole = await ensureRole({
    db,
    schema,
    role: {
      name: "superadmin",
      color: "#18181B",
      weight: 1000,
      permissions: BigInt(0),
    },
  });
  await ensureRole({
    db,
    schema,
    role: {
      name: "admin",
      color: "#3F3F46",
      weight: 500,
      permissions: BigInt(0),
    },
  });
  await ensureRole({
    db,
    schema,
    role: {
      name: "user",
      color: "#71717A",
      weight: 0,
      permissions: BigInt(0),
    },
  });

  const superadminEmail = process.env.SUPERADMIN_EMAIL || "admin@plexus.local";
  const superadminPassword =
    process.env.SUPERADMIN_PASSWORD || "PlexusAdmin123!";
  const superadminFullName = process.env.SUPERADMIN_NAME || "Super Admin";

  const nameParts = superadminFullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Super";
  const surname = nameParts.slice(1).join(" ") || "Admin";

  console.log("→ Zakládám superadmin uživatele…");
  const user = await ensureUserByEmail({
    db,
    schema,
    email: superadminEmail,
    name: firstName,
    surname,
  });

  await ensureUserRole({ db, schema, userId: user.id, roleId: superadminRole.id });

  const accountResult = await tryCreateCredentialAccount({
    db,
    schema,
    userId: user.id,
    password: superadminPassword,
  });

  console.log("");
  console.log("Hotovo.");
  console.log(`- Superadmin email: ${superadminEmail}`);
  console.log(`- Superadmin userId: ${user.id}`);
  console.log(`- Superadmin role: ${superadminRole.name}`);

  if (accountResult.created) {
    console.log("- Účet vytvořen.");
  } else if (accountResult.reason === "exists") {
    console.log("- Účet už existoval (heslo se neměnilo).");
  } else {
    console.log(
      "- Nepodařilo se vytvořit účet (nenašel jsem veřejný hash helper v Better Auth).",
    );
    console.log(
      "  Doporučení: přihlaš se přes existující flow (registrace / reset hesla / změna hesla) nebo doplň hash util podle verze Better Auth.",
    );
  }
}

main().catch((err) => {
  console.error("db:init selhal:", err);
  process.exit(1);
});

