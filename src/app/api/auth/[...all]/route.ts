/**
 * Obsluha API routy BetterAuth.
 * 
 * Tento catch-all route zpracovává všechny BetterAuth koncový body:
 * - /api/auth/sign-up/email
 * - /api/auth/sign-in/email
 * - /api/auth/sign-in/passkey
 * - /api/auth/sign-out
 * - /api/auth/session
 * - /api/auth/forget-password
 * - /api/auth/reset-password
 * - /api/auth/passkey/*
 * - atd.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
