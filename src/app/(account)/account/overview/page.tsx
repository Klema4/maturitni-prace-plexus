import Navbar from "@/app/components/blog/Navbar";
import Footer from "@/app/components/blog/Footer";
import OverviewPage from "@/app/features/blog/account/OverviewPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Přehled účtu",
};

/**
 * Server-side přehledová stránka účtu.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <OverviewPage />
      <Footer />
    </main>
  );
}
