"use client";

import { Megaphone } from "lucide-react";

export default function AdBlock() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-zinc-800 p-2 text-zinc-200">
          <Megaphone size={16} />
        </div>
        <div className="space-y-0">
          <h5 className="text-md font-semibold tracking-tight text-zinc-100">
            Dynamická reklama
          </h5>
          <p className="text-xs leading-6 tracking-tight font-medium text-zinc-400">
            Ne webu se objeví náhodná reklama jedné z firem zaregistrovaných na platformě.
          </p>
        </div>
      </div>
    </div>
  );
}
