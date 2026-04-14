import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/schema";
import { eq, and, isNull, gte, lte, sql, desc } from "drizzle-orm";

/**
 * Typ předplatného s uživatelem
 */
export type SubscriptionWithUser = {
  userId: string;
  subscriptionId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    image: string | null;
  };
};

/**
 * Typ předplatného
 */
export type Subscription = {
  userId: string;
  subscriptionId: string | null;
  startDate: Date | null;
  endDate: Date | null;
};

/**
 * Získání všech předplatných s uživateli
 */
export async function getAllSubscriptions(): Promise<SubscriptionWithUser[]> {
  const result = await db
    .select({
      userId: subscriptions.userId,
      subscriptionId: subscriptions.subscriptionId,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
        image: users.image,
      },
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(isNull(users.deletedAt))
    .orderBy(subscriptions.startDate);

  return result;
}

/**
 * Získání předplatného podle userId
 */
export async function getSubscriptionByUserId(
  userId: string
): Promise<Subscription | null> {
  const result = await db
    .select({
      userId: subscriptions.userId,
      subscriptionId: subscriptions.subscriptionId,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Získání aktivních předplatných
 */
export async function getActiveSubscriptions(
  date: Date = new Date()
): Promise<SubscriptionWithUser[]> {
  const result = await db
    .select({
      userId: subscriptions.userId,
      subscriptionId: subscriptions.subscriptionId,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
        image: users.image,
      },
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        isNull(users.deletedAt),
        lte(subscriptions.startDate, date),
        gte(subscriptions.endDate, date)
      )
    )
    .orderBy(subscriptions.endDate);

  return result;
}

/**
 * Získání ukončených předplatných
 */
export async function getExpiredSubscriptions(
  date: Date = new Date()
): Promise<SubscriptionWithUser[]> {
  const result = await db
    .select({
      userId: subscriptions.userId,
      subscriptionId: subscriptions.subscriptionId,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
        image: users.image,
      },
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        isNull(users.deletedAt),
        lte(subscriptions.endDate, date)
      )
    )
    .orderBy(desc(subscriptions.endDate));

  return result;
}

/**
 * Vytvoření nebo aktualizace předplatného
 */
export async function upsertSubscription(
  userId: string,
  data: {
    subscriptionId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  }
): Promise<Subscription> {
  const result = await db
    .insert(subscriptions)
    .values({
      userId,
      subscriptionId: data.subscriptionId || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        subscriptionId: data.subscriptionId !== undefined ? data.subscriptionId : sql`${subscriptions.subscriptionId}`,
        startDate: data.startDate !== undefined ? data.startDate : sql`${subscriptions.startDate}`,
        endDate: data.endDate !== undefined ? data.endDate : sql`${subscriptions.endDate}`,
      },
    })
    .returning({
      userId: subscriptions.userId,
      subscriptionId: subscriptions.subscriptionId,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
    });

  return result[0];
}

/**
 * Aktualizace předplatného
 */
export async function updateSubscription(
  userId: string,
  data: {
    subscriptionId?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  }
): Promise<Subscription | null> {
  const result = await db
    .update(subscriptions)
    .set({
      ...(data.subscriptionId !== undefined && { subscriptionId: data.subscriptionId }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
    })
    .where(eq(subscriptions.userId, userId))
    .returning({
      userId: subscriptions.userId,
      subscriptionId: subscriptions.subscriptionId,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
    });

  return result[0] || null;
}

/**
 * Smazání předplatného
 */
export async function deleteSubscription(userId: string): Promise<boolean> {
  try {
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    return true;
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return false;
  }
}

/**
 * Získání statistik předplatných
 */
export async function getSubscriptionStats() {
  const now = new Date();
  
  const [total, active, expired] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptions)
      .where(
        and(
          lte(subscriptions.startDate, now),
          gte(subscriptions.endDate, now)
        )
      ),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(subscriptions)
      .where(lte(subscriptions.endDate, now)),
  ]);

  return {
    total: Number(total[0]?.count) || 0,
    active: Number(active[0]?.count) || 0,
    expired: Number(expired[0]?.count) || 0,
  };
}
