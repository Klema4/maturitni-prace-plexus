import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllSubscriptionsService,
  getActiveSubscriptionsService,
  getExpiredSubscriptionsService,
  getSubscriptionByUserIdService,
  upsertSubscriptionService,
  updateSubscriptionService,
  deleteSubscriptionService,
  getSubscriptionStatsService,
} from "@/lib/services/subscriptionsService";

/**
 * GET /api/dashboard/subscriptions
 * Získání seznamu předplatných
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const userId = searchParams.get("userId");
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const subscriptionStats = await getSubscriptionStatsService();
      return NextResponse.json({ stats: subscriptionStats });
    }

    if (userId) {
      const subscription = await getSubscriptionByUserIdService(userId);
      if (!subscription) {
        return NextResponse.json(
          { error: "Předplatné nenalezeno" },
          { status: 404 }
        );
      }
      return NextResponse.json({ subscription });
    }

    let subscriptions;
    if (type === "active") {
      subscriptions = await getActiveSubscriptionsService();
    } else if (type === "expired") {
      subscriptions = await getExpiredSubscriptionsService();
    } else {
      subscriptions = await getAllSubscriptionsService();
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst předplatná" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/subscriptions
 * Vytvoření nebo aktualizace předplatného
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Chybí userId" },
        { status: 400 }
      );
    }

    const subscription = await upsertSubscriptionService(userId, data);

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error: any) {
    console.error("Error upserting subscription:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit/aktualizovat předplatné" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/dashboard/subscriptions
 * Aktualizace předplatného
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Chybí userId" },
        { status: 400 }
      );
    }

    const subscription = await updateSubscriptionService(userId, data);

    if (!subscription) {
      return NextResponse.json(
        { error: "Předplatné nenalezeno" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat předplatné" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/dashboard/subscriptions
 * Smazání předplatného
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Chybí userId" },
        { status: 400 }
      );
    }

    const success = await deleteSubscriptionService(userId);

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat předplatné" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat předplatné" },
      { status: 500 }
    );
  }
}
