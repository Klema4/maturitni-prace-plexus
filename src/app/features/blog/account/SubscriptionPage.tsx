import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/blog/ui/Button";
import { Card } from "@/app/components/blog/ui/Card";
import { Crown, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { getSubscriptionByUserIdService } from "@/lib/services/subscriptionsService";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

/** Pomocná funkce: je předplatné momentálně aktivní? */
function isSubscriptionActive(
  startDate: Date | null,
  endDate: Date | null,
  now: Date
): boolean {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= now && end >= now;
}

/**
 * Stránka předplatného (server component).
 * Načte reálný stav předplatného pro přihlášeného uživatele a zobrazí detail nebo CTA na zakoupení.
 * @returns {Promise<JSX.Element>} Předplatné.
 */
export default async function SubscriptionPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/account/auth/log-in");
  }

  const subscription = await getSubscriptionByUserIdService(session.user.id);
  const now = new Date();
  const hasActiveSubscription =
    subscription &&
    isSubscriptionActive(subscription.startDate, subscription.endDate, now);

  const endDate = subscription?.endDate
    ? new Date(subscription.endDate)
    : null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 my-8 px-4">
      <div>
        <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark">
          Předplatné
        </h1>
        <p className="text-zinc-600 text-base font-medium max-w-lg leading-relaxed tracking-tight">
          Spravujte své předplatné a užívejte si prémiový obsah bez reklam nebo zamčené články pouze pro předplatné.
        </p>
      </div>

      <Card className="p-8 border-none!">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="newsreader text-2xl font-medium tracking-tighter text-dark mb-2">
              {hasActiveSubscription
                ? "Aktivní předplatné"
                : "Žádné aktivní předplatné"}
            </h2>
            <p className="text-zinc-600 text-md font-medium tracking-tight mb-6">
              {hasActiveSubscription
                ? "Máte aktivní předplatné. Užívejte si prémiový obsah bez reklam."
                : "Nemáte aktivní předplatné. Přihlaste se k předplatnému a užívejte si prémiový obsah bez reklam."}
            </p>

            {hasActiveSubscription && endDate && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-600 text-md font-medium tracking-tight">
                  <Calendar size={18} className="text-primary shrink-0" />
                  <span>
                    Platnost do{" "}
                    <strong className="text-dark">
                      {format(endDate, "d. MMMM yyyy", { locale: cs })}
                    </strong>
                  </span>
                </div>
                <Button
                  href="/account/subscription/cancel"
                  variant="subtleDanger"
                  size="md"
                  className="tracking-tight cursor-pointer"
                >
                  Zrušit automatické obnovení předplatného
                </Button>
              </div>
            )}

            {!hasActiveSubscription && (
              <Button
                href="/account/subscription/payment"
                variant="primary"
                size="md"
              >
                Získat předplatné
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

