'use client'

interface CommandSeparatorProps {
  className?: string;
}

export function CommandSeparator({ className = "" }: CommandSeparatorProps) {
  return (
    <div className={`mx-4 my-1 h-px bg-zinc-800 ${className}`} />
  );
}
