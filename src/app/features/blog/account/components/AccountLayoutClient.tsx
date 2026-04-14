'use client';

import { usePathname } from 'next/navigation';
import AccountTabs from './AccountTabs';

/**
 * AccountLayoutClient
 * Pouze taby a obsah – Navbar a Footer jsou v nadřazeném AccountShell.
 */
export default function AccountLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showTabs =
    pathname === '/account/profile' ||
    pathname === '/account/settings' ||
    pathname === '/account/subscription' ||
    pathname === '/account/comments';

  return (
    <div className="pt-24 min-h-[60vh] h-auto">
      {showTabs ? (
        <div className="max-w-4xl mx-auto px-4">
          <AccountTabs />
          {children}
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
