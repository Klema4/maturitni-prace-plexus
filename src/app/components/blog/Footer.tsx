import FooterClient from './FooterClient';
import { getFooterSections } from '@/lib/repositories/sectionsRepository';
import { getDashboardSettingsService } from "@/lib/services/dashboardSettingsService";

/**
 * Serverový obal komponenty pro patičku.
 * Načítá sekce z databáze s cachováním a předává je klientské komponentě.
 */
export default async function Footer() {
  // Načteme sekce z DB (s cachováním na 5 minut)
  const sectionLinks = await getFooterSections();
  const settings = await getDashboardSettingsService();
  const brandName = settings?.seoName ?? settings?.name ?? "Plexus";

  return <FooterClient sectionLinks={sectionLinks} brandName={brandName} />;
}
