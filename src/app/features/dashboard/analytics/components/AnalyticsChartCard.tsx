"use client";

import type { ReactNode } from "react";
import { AreaChart, type CustomTooltipProps } from "@tremor/react";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import {
  AnalyticsChartRow,
  useAnalyticsChartCard,
} from "../hooks/useAnalyticsChartCard";

const numberFormatter = new Intl.NumberFormat("cs-CZ");

function formatDateLong(isoDate: string) {
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const firstPoint = payload[0];
  const rawRow = firstPoint.payload as AnalyticsChartRow;
  const dateValue =
    typeof rawRow.date === "string" ? rawRow.date : String(label ?? "");
  const metricLabel = String(firstPoint.name ?? "");
  const metricValue =
    typeof firstPoint.value === "number"
      ? firstPoint.value
      : Number(firstPoint.value ?? 0);

  return (
    <div className="rounded-lg border border-white/15 bg-zinc-950/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-xs text-zinc-300">{formatDateLong(dateValue)}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">
        {metricLabel}: {numberFormatter.format(metricValue)}
      </p>
    </div>
  );
}

export function AnalyticsChartCard({
  icon,
  title,
  apiUrl,
  valueKey,
  categoryLabel,
  color,
}: {
  icon: ReactNode;
  title: string;
  apiUrl: string;
  valueKey: string;
  categoryLabel: string;
  color: string;
}) {
  const { data, loading, error } = useAnalyticsChartCard({
    apiUrl,
    valueKey,
    categoryLabel,
  });

  const getValue = (row?: AnalyticsChartRow) =>
    typeof row?.[categoryLabel] === "number" ? (row[categoryLabel] as number) : 0;

  const latestValue = getValue(data.at(-1));
  const previousValue = getValue(data.at(-2));
  const trendDiff = latestValue - previousValue;
  const trendPercent =
    previousValue > 0 ? (trendDiff / previousValue) * 100 : null;
  const trendColorClass =
    trendDiff >= 0 ? "text-emerald-400" : "text-rose-400";
  const lineColorClass =
    color === "violet"
      ? "[&_.recharts-area-curve]:stroke-violet-400"
      : color === "cyan"
        ? "[&_.recharts-area-curve]:stroke-cyan-400"
        : color === "amber"
          ? "[&_.recharts-area-curve]:stroke-amber-400"
          : color === "emerald"
            ? "[&_.recharts-area-curve]:stroke-emerald-400"
            : "[&_.recharts-area-curve]:stroke-sky-400";

  return (
    <div className="p-3">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <Heading variant="h4">{title}</Heading>
      </div>
      {!loading && !error && data.length > 0 && (
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              {categoryLabel}
            </p>
            <p className="text-xl font-semibold text-zinc-100">
              {numberFormatter.format(latestValue)}
            </p>
          </div>
          <p className={`text-sm font-medium ${trendColorClass}`}>
            {trendPercent === null
              ? `${trendDiff >= 0 ? "+" : ""}${numberFormatter.format(trendDiff)}`
              : `${trendPercent >= 0 ? "+" : ""}${trendPercent.toFixed(1)}%`}
          </p>
        </div>
      )}
      <div className="h-72 w-full">
        {loading && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-800/50">
            <Paragraph color="muted" className="text-sm tracking-tight">
              Načítám graf...
            </Paragraph>
          </div>
        )}
        {error && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-800/50">
            <Paragraph
              color="muted"
              className="text-sm tracking-tight text-red-400"
            >
              {error}
            </Paragraph>
          </div>
        )}
        {!loading && !error && (
          <>
            {data.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-800/50">
                <Paragraph color="muted" className="text-sm tracking-tight">
                  Žádná data k zobrazení
                </Paragraph>
              </div>
            ) : (
              <AreaChart
                className={`h-full [&_.recharts-area-area]:fill-transparent [&_.recharts-area-area]:opacity-0 [&_.recharts-area-curve]:stroke-[2px] [&_.recharts-area-curve]:opacity-100 [&_.recharts-cartesian-axis-tick_text]:fill-zinc-400 [&_.recharts-cartesian-axis-tick_text]:text-xs [&_.recharts-cartesian-axis-tick_text]:font-medium [&_.recharts-cartesian-axis-tick_text]:tracking-tight [&_.recharts-cartesian-grid_line]:stroke-zinc-700/35 [&_.recharts-cartesian-grid_line]:stroke-[0.8px] [&_.recharts-label]:fill-zinc-400 [&_.recharts-label]:text-sm [&_.recharts-label]:font-medium [&_.recharts-label]:tracking-tight ${lineColorClass}`}
                data={data}
                index="dateLabel"
                categories={[categoryLabel]}
                colors={[color]}
                valueFormatter={(value) => numberFormatter.format(value)}
                showLegend={false}
                showGridLines={true}
                showAnimation={true}
                showGradient={false}
                curveType="monotone"
                yAxisWidth={64}
                tickGap={28}
                intervalType="preserveStartEnd"
                minValue={0}
                xAxisLabel="Datum"
                yAxisLabel={categoryLabel}
                customTooltip={ChartTooltip}
                noDataText="Žádná data"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
