import { Loader2 } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-black/10 bg-[linear-gradient(180deg,rgba(250,250,250,0.9),rgba(244,244,245,0.65))] px-5 py-9 text-center">
      <p className="text-base font-semibold tracking-tight text-dark">{title}</p>
      <p className="mt-2 text-sm font-medium tracking-tight text-zinc-500">{description}</p>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-black/6 bg-white/85 px-6 py-10 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-sm font-medium tracking-tight">{label}</p>
      </div>
    </div>
  );
}
