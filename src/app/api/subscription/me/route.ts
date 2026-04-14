import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getSubscriptionByUserIdService,
  deleteSubscriptionService,
} from "@/lib/services/subscriptionsService";

type SubscriptionStatusResponse = {
  hasSubscription: boolean;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
};

/**
 * GET /api/subscription/me
 * Vrátí informaci o předplatném aktuálně přihlášeného uživatele.
 * Používá BetterAuth session a subscriptionsService.
 *
 * @param {NextRequest} požadavek - HTTP požadavek objekt.
 * @returns {Promise<NextResponse<SubscriptionStatusResponse | { error: string }>>} JSON s informací o předplatném.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<SubscriptionStatusResponse | { error: string }>> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const subscription = await getSubscriptionByUserIdService(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        {
          hasSubscription: false,
          isActive: false,
          startDate: null,
          endDate: null,
        },
        { status: 200 }
      );
    }

    const now = new Date();
    const startDate = subscription.startDate
      ? new Date(subscription.startDate)
      : null;
    const endDate = subscription.endDate
      ? new Date(subscription.endDate)
      : null;

    const isActive =
      !!startDate && !!endDate && startDate <= now && endDate >= now;

    return NextResponse.json(
      {
        hasSubscription: true,
        isActive,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst předplatné" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscription/me
 * Zruší (smaže) předplatné aktuálně přihlášeného uživatele.
 * V reálné implementaci by místo smazání předplatného typicky vypnulo automatické obnovení.
 *
 * @param {NextRequest} požadavek - HTTP požadavek objekt.
 * @returns {Promise<NextResponse<{ success: boolean } | { error: string }>>} Výsledek operace.
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    await deleteSubscriptionService(session.user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Nepodařilo se zrušit předplatné" },
      { status: 500 }
    );
  }
}

