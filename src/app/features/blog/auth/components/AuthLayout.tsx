'use client';

/**
 * Layout komponenta pro auth stránky.
 * Zajišťuje konzistentní layout pro auth obsah.
 * @param {Object} props - Vlastnosti komponenty.
 * @param {React.ReactNode} props.children - Obsah stránky.
 * @returns {JSX.Element} AuthLayout komponenta.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] h-auto flex items-center justify-center px-4 lg:px-8">
        {children}
    </div>
  );
}
