"use client";

import { Textarea } from "@/components/ui/dashboard/Inputs";
import { clsx } from "clsx";

export type CalloutType = "info" | "warning" | "success" | "tip";

interface CalloutBlockProps {
  content: {
    type: CalloutType;
    text: string;
  };
  onChange: (content: { type: CalloutType; text: string }) => void;
}

const calloutTypeLabels: Record<CalloutType, string> = {
  info: "Informace",
  warning: "Varování",
  success: "Úspěch",
  tip: "Tip",
};

const calloutTypeClasses: Record<CalloutType, string> = {
  info: "border-blue-500/30 bg-blue-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  success: "border-emerald-500/30 bg-emerald-500/10",
  tip: "border-indigo-500/30 bg-indigo-500/10",
};

export default function CalloutBlock({
  content,
  onChange,
}: CalloutBlockProps) {
  return (
    <div
      className={clsx(
        "space-y-4 rounded-lg border p-2 transition-colors",
        calloutTypeClasses[content.type],
      )}
    >
      <div className="flex flex-wrap gap-2">
        {(Object.keys(calloutTypeLabels) as CalloutType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ ...content, type })}
            className={clsx(
              "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium tracking-tight transition-colors",
              content.type === type
                ? "border-white bg-white text-zinc-950"
                : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500",
            )}
          >
            {calloutTypeLabels[type]}
          </button>
        ))}
      </div>

      <Textarea
        label="Text poznámky"
        value={content.text}
        onChange={(event) => onChange({ ...content, text: event.target.value })}
        placeholder="Napiš poznámku nebo upozornění"
        className="min-h-[8rem] bg-zinc-950/40"
      />
    </div>
  );
}
