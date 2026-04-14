import type { ReactNode } from "react";
import { Card } from "@/app/components/blog/ui/Card";

export function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-tight text-zinc-500">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-dark md:text-[2rem]">{value}</p>
          {helper ? (
            <p className="text-sm font-medium tracking-tight text-zinc-500">{helper}</p>
          ) : null}
        </div>
        {icon ? <div className="rounded-lg border border-black/6 bg-zinc-50 p-2 text-zinc-700">{icon}</div> : null}
      </div>
    </Card>
  );
}
