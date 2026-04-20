import NavbarClient from '@/app/components/blog/NavbarClient';
import FooterClient from '@/app/components/blog/FooterClient';
import type { NavLink, NavbarViewer } from '@/app/components/blog/NavbarClient';
import type { FooterLink } from '@/app/components/blog/FooterClient';

interface AccountShellProps {
  children: React.ReactNode;
  navLinks: NavLink[];
  sectionLinks: FooterLink[];
  brandName: string;
  viewer?: NavbarViewer | null;
}

/**
 * AccountShell
 * Navbar a Footer jen pro ne-auth stránky.
 * Data se načítají na serveru, aby se db nepoužívala v client komponentách.
 */
export default function AccountShell({
  children,
  navLinks,
  sectionLinks,
  brandName,
  viewer = null,
}: AccountShellProps) {
  return (
    <>
      <NavbarClient navLinks={navLinks} brandName={brandName} viewer={viewer} />
      {children}
      <FooterClient sectionLinks={sectionLinks} brandName={brandName} />
    </>
  );
}
