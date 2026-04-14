"use client";

interface CodeBlockProps {
  content: {
    code: string;
    language?: string;
  };
  onChange: (content: { code: string; language?: string }) => void;
}

const supportedLanguages = [
  "typescript",
  "javascript",
  "python",
  "html",
  "css",
  "json",
  "sql",
  "bash",
];

export default function CodeBlock({ content, onChange }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 p-1.5 pl-3">
        <label className="text-xs font-medium tracking-tight text-zinc-400">
          Jazyk
        </label>
        <select
          value={content.language || "typescript"}
          onChange={(event) =>
            onChange({ ...content, language: event.target.value })
          }
          className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs font-medium tracking-tight text-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          {supportedLanguages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[auto_1fr]">
        <div className="border-r border-zinc-800 bg-zinc-900/50 px-3 py-4 text-right text-xs leading-6 text-zinc-600">
          {content.code.split("\n").map((_, index) => (
            <div key={`${index + 1}`}>{index + 1}</div>
          ))}
        </div>
        <textarea
          value={content.code}
          onChange={(event) =>
            onChange({ ...content, code: event.target.value })
          }
          placeholder="// Sem vlož kód"
          spellCheck={false}
          rows={Math.max(content.code.split("\n").length, 6)}
          className="min-h-[12rem] resize-y border-none bg-transparent px-4 py-4 font-mono text-sm leading-6 text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
