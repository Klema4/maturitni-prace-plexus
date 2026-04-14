'use client'

interface CommandEmptyProps {
  message?: string;
  className?: string;
}

export function CommandEmpty({ 
  message = "Žádné výsledky nenalezeny.",
  className = "" 
}: CommandEmptyProps) {
  return (
    <div className={`py-8 px-4 text-center text-zinc-500 text-sm ${className}`}>
      {message}
    </div>
  );
}
