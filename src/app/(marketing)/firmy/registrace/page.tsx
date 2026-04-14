import Navbar from "@/app/components/blog/Navbar";
import Footer from "@/app/components/blog/Footer";
import CompanyRegistrationPage from "@/app/features/ads/company-registration/CompanyRegistrationPage";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ reason?: string }>;
};

/**
 * Stránka `/firmy/registrace`.
 * Routing wrapper, který přidá globální blogový Navbar a Footer.
 * @param {PageProps} props - Props včetně searchParams.
 * @returns {React.ReactElement} Stránka firemní registrace.
 */
export default async function Page({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CompanyRegistrationPage searchParams={searchParams} />
      <Footer />
    </main>
  );
}

