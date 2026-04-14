"use client";

import { useEffect, useState } from "react";
import { getAnalyticsChartData } from "../api/analytics.api";
import type { AnalyticsChartPoint } from "../types";

export type AnalyticsChartRow = {
  date: string;
  dateLabel: string;
  [key: string]: number | string;
};

function formatDateTick(isoDate: string) {
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsedDate);
}

export function useAnalyticsChartCard({
  apiUrl,
  valueKey,
  categoryLabel,
}: {
  apiUrl: string;
  valueKey: string;
  categoryLabel: string;
}) {
  const [data, setData] = useState<AnalyticsChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = (await getAnalyticsChartData(apiUrl)) as AnalyticsChartPoint[];
        const mapped: AnalyticsChartRow[] = raw.map((point) => {
          const date = String(point.date).slice(0, 10);

          return {
            date,
            dateLabel: formatDateTick(date),
            [categoryLabel]: Number(point[valueKey] ?? 0),
          };
        });

        setData(mapped);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Chyba při načítání",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchChartData();
  }, [apiUrl, categoryLabel, valueKey]);

  return {
    data,
    loading,
    error,
  };
}
