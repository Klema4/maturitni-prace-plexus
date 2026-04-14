import { z } from "zod";

/**
 * Schéma pro předplatné
 */
export const SubscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

/**
 * Schéma pro vytvoření/aktualizaci předplatného
 */
export const UpsertSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export type UpsertSubscription = z.infer<typeof UpsertSubscriptionSchema>;
