import {
  getAllSubscriptions,
  getSubscriptionByUserId,
  getActiveSubscriptions,
  getExpiredSubscriptions,
  upsertSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
} from "@/lib/repositories/subscriptionsRepository";
import { UpsertSubscriptionSchema } from "@/lib/schemas/subscriptionsSchema";
import { PocPaymentRequestSchema } from "@/lib/schemas/pocPaymentSchema";

export function isSubscriptionActive(
  startDate: Date | null,
  endDate: Date | null,
  now: Date = new Date(),
) {
  if (!startDate || !endDate) {
    return false;
  }

  return new Date(startDate) <= now && new Date(endDate) >= now;
}

/**
 * Získání všech předplatných
 */
export async function getAllSubscriptionsService() {
  return await getAllSubscriptions();
}

/**
 * Získání aktivních předplatných
 */
export async function getActiveSubscriptionsService(date?: Date) {
  return await getActiveSubscriptions(date);
}

/**
 * Získání ukončených předplatných
 */
export async function getExpiredSubscriptionsService(date?: Date) {
  return await getExpiredSubscriptions(date);
}

/**
 * Získání předplatného podle userId
 */
export async function getSubscriptionByUserIdService(userId: string) {
  return await getSubscriptionByUserId(userId);
}

export async function getHasActiveSubscriptionService(userId: string) {
  const subscription = await getSubscriptionByUserId(userId);
  return isSubscriptionActive(
    subscription?.startDate ?? null,
    subscription?.endDate ?? null,
  );
}

/**
 * Vytvoření nebo aktualizace předplatného
 */
export async function upsertSubscriptionService(
  userId: string,
  data: unknown
) {
  const validatedData = UpsertSubscriptionSchema.parse(data);

  // Konverze string datetime na Date
  const processedData = {
    ...validatedData,
    startDate: validatedData.startDate
      ? new Date(validatedData.startDate)
      : null,
    endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
  };

  return await upsertSubscription(userId, processedData);
}

/**
 * Aktualizace předplatného
 */
export async function updateSubscriptionService(
  userId: string,
  data: unknown
) {
  const validatedData = UpsertSubscriptionSchema.parse(data);

  const processedData = {
    ...validatedData,
    startDate: validatedData.startDate
      ? new Date(validatedData.startDate)
      : undefined,
    endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
  };

  return await updateSubscription(userId, processedData);
}

/**
 * Smazání předplatného
 */
export async function deleteSubscriptionService(userId: string) {
  return await deleteSubscription(userId);
}

/**
 * Získání statistik předplatných
 */
export async function getSubscriptionStatsService() {
  return await getSubscriptionStats();
}

/**
 * PoC platba předplatného (Stripe-style simulace)
 */
export async function processPocPaymentService(userId: string, data: unknown) {
  const { cardNumber } = PocPaymentRequestSchema.parse(data);
  const normalizedCardNumber = cardNumber.replace(/\s+/g, "");

  if (normalizedCardNumber === "4242424242424242") {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    await upsertSubscriptionService(userId, {
      subscriptionId: null,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
    });

    return {
      ok: true,
      status: "success" as const,
      subscriptionUpdated: true,
    };
  }

  if (normalizedCardNumber === "4000000000000002") {
    return {
      ok: true,
      status: "declined" as const,
      subscriptionUpdated: false,
    };
  }

  if (normalizedCardNumber === "4000000000009995") {
    return {
      ok: true,
      status: "failed" as const,
      subscriptionUpdated: false,
    };
  }

  return {
    ok: true,
    status: "failed" as const,
    subscriptionUpdated: false,
  };
}
