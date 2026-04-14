import type { ReactNode } from "react";
import { Card } from "@/app/components/blog/ui/Card";

export function Panel({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-black/6 bg-white/92 p-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.34)] md:p-6">
      <div className="mb-5 flex flex-col gap-4 border-b border-black/6 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="newsreader text-xl font-medium tracking-tight text-dark">{title}</h3>
          {description ? (
            <p className="max-w-2xl text-sm font-medium leading-relaxed tracking-tight text-zinc-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}
