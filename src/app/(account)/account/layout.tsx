import AccountLayoutClient from '@/app/features/blog/account/components/AccountLayoutClient';

/**
 * Layout pro sekci účtu.
 * Předává children do client komponenty, která rozhoduje o zobrazení tabů.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
