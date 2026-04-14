import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/lib/schema";

if (typeof window !== "undefined") {
  throw new Error("Database connection cannot be used in client components");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
