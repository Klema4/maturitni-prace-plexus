'use client';

import Avatar from "@/components/ui/dashboard/Avatar";
import { Card } from "@/components/ui/dashboard/Card";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { StatsCard } from "@/components/ui/dashboard/StatsCard";
import { cs } from "date-fns/locale";
import type { Subscription, SubscriptionFilterType } from "./types";
import { useSubscriptionsPage } from "./hooks/useSubscriptionsPage";

/** Vrátí true, pokud je předplatné momentálně aktivní (startDate <= now <= endDate). */
function isSubscriptionActive(sub: Subscription, now: Date): boolean {
  if (!sub.startDate || !sub.endDate) return false;
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);
  return start <= now && end >= now;
}

function formatDateOrDash(value: string | null) {
  if (!value) return "—";
  return format(new Date(value), "d. M. yyyy", { locale: cs });
}

const FILTER_OPTIONS: { value: SubscriptionFilterType; label: string }[] = [
  { value: 'all', label: 'Všechna' },
  { value: 'active', label: 'Aktivní' },
  { value: 'expired', label: 'Ukončená' },
];

export default function Subscriptions() {
  const {
    subscriptions,
    stats,
    loading,
    error,
    filter,
    deletingUserId,
    now,
    setFilter,
    handleDelete,
  } = useSubscriptionsPage();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Předplatná</Heading>
          <Paragraph>Spravuj předplatné a fakturace uživatelů.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám předplatná...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Předplatná</Heading>
          <Paragraph>Spravuj předplatné a fakturace uživatelů.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">{error}</Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Předplatná</Heading>
        <Paragraph>Spravuj předplatné a fakturace uživatelů.</Paragraph>
      </header>
      <section className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatsCard
            icon={<CheckCircle size={20} />}
            label="Aktivní"
            value={stats.active.toString()}
          />
          <StatsCard
            icon={<XCircle size={20} />}
            label="Ukončená"
            value={stats.expired.toString()}
          />
          <StatsCard
            icon={<CheckCircle size={20} />}
            label="Celkem"
            value={stats.total.toString()}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium tracking-tight text-zinc-400">Filtrovat:</span>
          <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/60 p-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium tracking-tight transition-all active:scale-[0.98] ${
                  filter === opt.value
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'border border-zinc-700/50 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Heading variant="h3">
          {filter === 'all' ? 'Všechna předplatná' : filter === 'active' ? 'Aktivní předplatná' : 'Ukončená předplatná'}
        </Heading>
        <div className="mt-4">
          {subscriptions.length === 0 ? (
            <Card className="p-6">
              <Paragraph color="muted">Žádná předplatná k zobrazení.</Paragraph>
            </Card>
          ) : (
            <div className="space-y-0">
              {subscriptions.map((sub) => {
                const active = isSubscriptionActive(sub, now);
                const isDeleting = deletingUserId === sub.userId;
                return (
                  <div
                    key={sub.userId}
                    className="flex justify-between items-center gap-3 not-last:border-b border-zinc-700/50 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={sub.user.image ?? undefined}
                        alt={`${sub.user.name} ${sub.user.surname}`}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:gap-3 min-w-0">
                          <Heading variant="h6" className="leading-4! truncate">
                            {sub.user.name} {sub.user.surname}
                          </Heading>
                          <Paragraph size="extrasmall" className="truncate">
                            {sub.user.email}
                          </Paragraph>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold tracking-tight ${
                              active
                                ? "border-green-600/50 bg-green-900/30 text-green-200"
                                : "border-red-600/50 bg-red-900/30 text-red-200"
                            }`}
                          >
                            {active ? (
                              <CheckCircle size={14} className="text-green-400" />
                            ) : (
                              <XCircle size={14} className="text-red-400" />
                            )}
                            {active ? "Aktivní" : "Ukončené"}
                          </span>
                          <span className="text-xs font-medium tracking-tight text-zinc-400">
                            Od:{" "}
                            <span className="text-zinc-200">
                              {formatDateOrDash(sub.startDate)}
                            </span>
                          </span>
                          <span className="text-xs font-medium tracking-tight text-zinc-400">
                            Do:{" "}
                            <span className="text-zinc-200">
                              {formatDateOrDash(sub.endDate)}
                            </span>
                          </span>
                          {sub.subscriptionId && (
                            <span className="text-xs font-medium tracking-tight text-zinc-500 truncate">
                              ID:{" "}
                              <span className="text-zinc-300">{sub.subscriptionId}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.userId)}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-md size-6 flex items-center justify-center text-zinc-400 transition-colors hover:bg-red-900/20 hover:text-red-400 disabled:opacity-50"
                        title="Zrušit předplatné"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
