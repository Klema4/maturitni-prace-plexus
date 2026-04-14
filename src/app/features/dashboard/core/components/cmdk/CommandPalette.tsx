'use client'

import { useEffect, useState, useRef } from 'react';
import { CommandProvider } from './CommandProvider';
import { CommandInput } from './CommandInput';
import { CommandList } from './CommandList';
import { CommandEmpty } from './CommandEmpty';
import { CommandGroup } from './CommandGroup';
import { CommandItem } from './CommandItem';
import { CommandSeparator } from './CommandSeparator';
import { useCommandState } from '@/utils/cmdk/useCommandState';

type CommandPaletteProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  apiEndpoint?: string;
  className?: string;
};

export default function CommandPalette({
  open,
  setOpen,
  children,
  placeholder = "Zadejte příkaz...",
  emptyMessage = "Žádné výsledky nenalezeny.",
  apiEndpoint,
  className = ""
}: CommandPaletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
    };

    // Použití capture fáze s vysokou prioritou
    document.addEventListener('keydown', down, {
      capture: true,
      passive: false
    });
    
    return () => {
      document.removeEventListener('keydown', down, {
        capture: true
      } as any);
    };
  }, [setOpen]);

  useEffect(() => {
    if (open && containerRef.current) {
      const input = containerRef.current.querySelector('input');
      input?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Zavřít command palette"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 backdrop-blur-sm transition-all duration-200"
      style={{
        animation: 'fadeInBackdrop 0.2s ease-out forwards',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          setOpen(false);
        }
      }}
    >
      <div
        ref={containerRef}
        className="w-full flex justify-center transition-all duration-200 ease-out opacity-0 scale-95"
        style={{
          animation: 'cmdkFadeIn 0.2s cubic-bezier(0.4,0,0.2,1) forwards',
        }}
      >
        <CommandProvider
          apiEndpoint={apiEndpoint}
          onClose={() => setOpen(false)}
        >
          <div className={`bg-zinc-900 border border-zinc-800/50 rounded-xl w-full sm:min-w-[480px] max-w-[640px] max-h-[60vh] overflow-hidden ${className}`}>
            <CommandInput placeholder={placeholder} />
            <CommandList emptyMessage={emptyMessage}>
              {children}
            </CommandList>
          </div>
        </CommandProvider>
      </div>
      
      <style jsx>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdkFadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-10px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Export podkomponent pro snadné použití
export {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator
};
