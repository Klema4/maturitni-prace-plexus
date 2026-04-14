'use client';

import { clsx } from 'clsx';
import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

export interface ArticlesSearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
}

/**
 * Custom input pro vyhledávání článků.
 */
export default function ArticlesSearchInput({
  className,
  type = 'search',
  label = 'Vyhledat články',
  ...props
}: ArticlesSearchInputProps) {
  return (
    <label className="flex flex-col gap-2 w-full">
      <span className="text-sm font-medium tracking-tight text-dark">{label}</span>
      <div className="flex items-center gap-3 px-4 py-3 bg-white/75 border border-zinc-200 rounded-full">
        <Search className="w-4 h-4 text-zinc-600" />
        <input
          placeholder="Hledat články podle názvu, tématu nebo autora..."
          type={type}
          className="flex-1 bg-transparent outline-none text-dark placeholder:text-zinc-500 text-sm tracking-tight focus:ring-0"
          {...props}
        />
      </div>
    </label>
  );
}
