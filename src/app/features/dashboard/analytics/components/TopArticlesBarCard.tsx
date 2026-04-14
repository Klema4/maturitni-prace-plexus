"use client";

import { BarChart3 } from "lucide-react";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { useTopArticlesBarCard } from "../hooks/useTopArticlesBarCard";

const numberFormatter = new Intl.NumberFormat("cs-CZ");

export function TopArticlesBarCard() {
  const { data, loading, error } = useTopArticlesBarCard();
  const maxViews = Math.max(...data.map((item) => item.viewCount), 0);

  return (
    <div className="p-3">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-cyan-400" />
        <Heading variant="h4">Top články podle zobrazení</Heading>
      </div>
      {loading && (
        <div className="flex h-72 w-full items-center justify-center rounded-lg bg-zinc-800/50">
          <Paragraph color="muted" className="text-sm tracking-tight">
            Načítám graf...
          </Paragraph>
        </div>
      )}
      {error && (
        <div className="flex h-72 w-full items-center justify-center rounded-lg bg-zinc-800/50">
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
            <div className="flex h-72 w-full items-center justify-center rounded-lg bg-zinc-800/50">
              <Paragraph color="muted" className="text-sm tracking-tight">
                Žádná data k zobrazení
              </Paragraph>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((item, index) => {
                const percent = maxViews > 0 ? (item.viewCount / maxViews) * 100 : 0;
                const widthPercent = Math.max(28, Math.round(percent));

                return (
                  <div
                    key={item.id}
                    className="relative h-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50"
                  >
                    <div
                      className="absolute inset-y-0 left-0 flex items-center justify-between rounded-lg bg-gradient-to-r from-cyan-500/85 to-sky-500/85 px-3"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <p className="max-w-[70%] truncate text-xs font-medium tracking-tight text-white">
                        {index + 1}. {item.title}
                      </p>
                      <p className="shrink-0 text-xs font-semibold tracking-tight text-white">
                        {numberFormatter.format(item.viewCount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
