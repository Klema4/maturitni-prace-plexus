import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono, newsreader } from "@/lib/fonts";
import { getDashboardSettingsService } from "@/lib/services/dashboardSettingsService";

/**
 * generateMetadata
 * Načte veřejné SEO nastavení z databáze a použije ho jako základ pro title/description/OG.
 * @returns {Promise<Metadata>} Metadata pro celý web (root layout).
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getDashboardSettingsService();
  const siteTitle = settings?.seoName ?? settings?.name ?? "Plexus";
  const description =
    settings?.seoDescription ??
    "Blogový a komplexní redakční systém s vlastní reklamní platformou a analytickými nástroji";

  const metadataBase = (() => {
    if (!settings?.seoUrl) return undefined;
    try {
      return new URL(settings.seoUrl);
    } catch {
      return undefined;
    }
  })();

  const ogImageUrl = settings?.seoImageUrl ?? null;

  return {
    metadataBase,
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description,
    authors: settings?.seoAuthor ? [{ name: settings.seoAuthor }] : undefined,
    openGraph: {
      type: "website",
      siteName: siteTitle,
      title: siteTitle,
      description,
      ...(settings?.seoUrl ? { url: settings.seoUrl } : {}),
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: siteTitle,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
