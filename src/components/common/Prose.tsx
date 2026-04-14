import type { ReactNode } from 'react';

/**
 * Sdílená typografie pro dlouhé texty (legal/static stránky).
 * Nepoužívá `prose` plugin – styluje elementy přes selektory (`[&_h2]...`),
 * aby to fungovalo konzistentně i bez Tailwind Typography.
 *
 * @param {object} props - Props komponenty.
 * @param {ReactNode} props.children - Obsah v typografickém wrapperu.
 * @param {string} [props.className] - Volitelné rozšíření tříd.
 * @returns {JSX.Element} Typografický wrapper.
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        'text-zinc-800',
        '[&_p]:tracking-tight [&_p]:leading-relaxed [&_p]:mt-4 [&_p:first-child]:mt-0',
        '[&_strong]:text-zinc-900',
        '[&_a]:tracking-tight [&_a]:font-medium [&_a]:cursor-pointer [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-90',
        '[&_h2]:tracking-tighter [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:lg:text-3xl [&_h2]:font-bold [&_h2]:text-zinc-900',
        '[&_h3]:tracking-tighter [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:lg:text-2xl [&_h3]:font-bold [&_h3]:text-zinc-900',
        '[&_ul]:mt-4 [&_ul]:pl-6 [&_ul]:list-disc',
        '[&_ol]:mt-4 [&_ol]:pl-6 [&_ol]:list-decimal',
        '[&_li]:tracking-tight [&_li]:mt-1',
        '[&_hr]:my-10 [&_hr]:border-zinc-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

