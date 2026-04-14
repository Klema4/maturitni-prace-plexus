'use client'

import { useCommand } from './CommandProvider';
import { Search } from 'lucide-react';

interface CommandInputProps {
  placeholder?: string;
  className?: string;
}

export function CommandInput({ 
  placeholder = "Zadejte příkaz...", 
  className = "" 
}: CommandInputProps) {
  const { state, actions } = useCommand();
  
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 ${className}`}>
      <Search className="w-4 h-4 text-zinc-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={state.query}
        onChange={(e) => actions.setQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-zinc-200 focus:text-white placeholder:text-zinc-500/50 text-sm"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {state.isLoading && (
        <div className="w-4 h-4 border-2 border-zinc-800/50 border-t-zinc-800/50 rounded-full animate-spin" />
      )}
    </div>
  );
}
