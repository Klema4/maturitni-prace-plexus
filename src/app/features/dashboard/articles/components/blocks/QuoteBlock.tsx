"use client";

import { Input, Textarea } from "@/components/ui/dashboard/Inputs";

interface QuoteBlockProps {
  content: {
    text: string;
    author?: string;
  };
  onChange: (content: { text: string; author?: string }) => void;
}

export default function QuoteBlock({ content, onChange }: QuoteBlockProps) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/20 p-2">
      <Textarea
        label="Text citace"
        value={content.text}
        onChange={(event) =>
          onChange({ ...content, text: event.target.value })
        }
        placeholder="Napiš text citátu"
        className="min-h-[8rem] border-zinc-600 bg-zinc-800"
      />
      <Input
        label="Autor citace"
        value={content.author || ""}
        onChange={(event) =>
          onChange({ ...content, author: event.target.value })
        }
        placeholder="Např. Karel Čapek"
      />
    </div>
  );
}
