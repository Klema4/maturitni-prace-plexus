'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Settings, CreditCard, MessageSquare } from 'lucide-react';

const TABS = [
  { href: '/account/profile', label: 'Profil', icon: User },
  { href: '/account/settings', label: 'Nastavení', icon: Settings },
  { href: '/account/subscription', label: 'Předplatné', icon: CreditCard },
  { href: '/account/comments', label: 'Moje komentáře', icon: MessageSquare },
];

/**
 * AccountTabs
 * Taby pro navigaci v sekci účtu.
 */
export default function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b border-zinc-200 pb-4 mb-8">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          (tab.href !== '/account/profile' && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium tracking-tight transition-colors cursor-pointer ${
              isActive
                ? 'bg-primary text-white'
                : 'text-zinc-600 hover:text-primary hover:bg-primary/10'
            }`}
          >
            <Icon size={18} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
