"use client";

import { Paragraph } from "@/components/ui/dashboard/TextUtils";

export default function DividerBlock() {
  return (
    <div className="space-y-2 py-2">
      <Paragraph size="small" textAlign="center" color="muted">
        Oddělovač
      </Paragraph>
      <div className="flex items-center justify-center">
        <div className="h-px w-full bg-zinc-800" />
      </div>
    </div>
  );
}
