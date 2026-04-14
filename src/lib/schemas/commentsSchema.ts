import { z } from "zod";

/**
 * Schéma pro validaci UUID threadId
 */
export const ThreadIdSchema = z.string().uuid("Neplatný identifikátor diskuze");

/**
 * Schéma pro vytvoření komentáře
 */
export const CreateCommentSchema = z.object({
  content: z.string().min(1, "Komentář nesmí být prázdný").max(1000, "Komentář může mít maximálně 1000 znaků"),
  parentId: z.string().uuid().optional().nullable(),
});

/**
 * Schéma pro hodnocení komentáře
 */
export const RateCommentSchema = z.object({
  isLike: z.boolean(),
});
