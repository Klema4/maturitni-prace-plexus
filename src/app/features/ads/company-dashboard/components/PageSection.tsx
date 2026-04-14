import type { ReactNode } from "react";

export function PageSection({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <div className="space-y-2.5">
          <h2 className="newsreader text-2xl font-medium tracking-[-0.04em] text-dark md:text-[3rem] md:leading-none">{title}</h2>
          <p className="max-w-2xl text-xs font-medium leading-relaxed tracking-tight text-zinc-600 md:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
