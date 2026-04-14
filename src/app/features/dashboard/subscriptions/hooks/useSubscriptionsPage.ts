"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteDashboardSubscription,
  getDashboardSubscriptionStats,
  listDashboardSubscriptions,
} from "../api/subscriptions.api";
import type { Subscription, SubscriptionFilterType } from "../types";

export function useSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({ active: 0, expired: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SubscriptionFilterType>("all");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);

  const fetchData = useCallback(async (type: SubscriptionFilterType = "all") => {
    try {
      setError(null);

      const [subscriptionsData, statsData] = await Promise.all([
        listDashboardSubscriptions(type),
        getDashboardSubscriptionStats(),
      ]);

      setSubscriptions(subscriptionsData);
      setStats(statsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchData(filter);
  }, [fetchData, filter]);

  const handleDelete = useCallback(
    async (userId: string) => {
      if (!window.confirm("Opravdu chcete zrušit předplatné tohoto uživatele?")) {
        return;
      }

      setDeletingUserId(userId);

      try {
        await deleteDashboardSubscription(userId);
        await fetchData(filter);
      } catch (deleteError) {
        setError(
          deleteError instanceof Error ? deleteError.message : "Chyba při mazání",
        );
      } finally {
        setDeletingUserId(null);
      }
    },
    [fetchData, filter],
  );

  return {
    subscriptions,
    stats,
    loading,
    error,
    filter,
    deletingUserId,
    now,
    setFilter,
    handleDelete,
  };
}
