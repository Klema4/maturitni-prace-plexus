import AccountShell from '@/app/features/blog/account/components/AccountShell';
import { getNavSections, getFooterSections } from '@/lib/repositories/sectionsRepository';
import { getDashboardSettingsService } from "@/lib/services/dashboardSettingsService";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/repositories/userRepository";
import { getSafeImageSrc } from "@/lib/utils/image";

/**
 * Layout pro (account) skupinu rout.
 * Načte data pro Navbar a Footer na serveru a předá je AccountShell.
 */
export default async function AccountGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navLinks, sectionLinks, settings] = await Promise.all([
    getNavSections(),
    getFooterSections(),
    getDashboardSettingsService(),
  ]);

  const brandNameRaw = settings?.seoName ?? settings?.name ?? "";
  const brandName = brandNameRaw.trim() ? brandNameRaw.trim() : "Plexus";

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
        image: getSafeImageSrc(user.image),
      };
    }

    return {
      id: userId,
      name: session?.user?.name || "Uživatel",
      surname: "",
      image: getSafeImageSrc(session?.user?.image || null),
    };
  })();

  return (
    <AccountShell
      navLinks={[...navLinks, { href: "/articles", label: "Všechny články" }]}
      sectionLinks={sectionLinks}
      brandName={brandName}
      viewer={viewer}
    >
      {children}
    </AccountShell>
  );
}
