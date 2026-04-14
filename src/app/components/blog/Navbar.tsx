import NavbarClient, { type NavLink } from './NavbarClient';
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/repositories/userRepository";
import { getNavSections } from '@/lib/repositories/sectionsRepository';
import { getDashboardSettingsService } from "@/lib/services/dashboardSettingsService";

/**
 * Serverový obal navigace.
 * Načte sekce a přihlášeného uživatele, klient řeší jen UI.
 */
export default async function Navbar() {
  const settings = await getDashboardSettingsService();
  const brandNameRaw = settings?.seoName ?? settings?.name ?? "";
  const brandName = brandNameRaw.trim() ? brandNameRaw.trim() : "Plexus";

  const sections = await getNavSections();

  const navLinks: NavLink[] = [
    ...sections,
    { href: '/articles', label: 'Všechny články' },
  ];

  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  const viewer = await (async () => {
    const userId = session?.user?.id;
    if (!userId) return null;

    const user = await getUserById(userId);
    if (user) {
      return {
        id: user.id,
        name: user.name || "Uživatel",
        surname: user.surname || "",
        image: user.image || null,
      };
    }

    return {
      id: userId,
      name: session?.user?.name || "Uživatel",
      surname: "",
      image: session?.user?.image || null,
    };
  })();

  return <NavbarClient navLinks={navLinks} brandName={brandName} viewer={viewer} />;
}
