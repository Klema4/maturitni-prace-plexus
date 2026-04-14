import SubscriptionCancelPage from "@/app/features/blog/account/SubscriptionCancelPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zrušení předplatného",
};

/**
 * Stránka pro zrušení předplatného
 * Slouží jako mockup pro maturitní komisi – umožňuje demonstraci vypnutí
 * automatického obnovení předplatného.
 * Navbar a Footer zajišťuje AccountShell v layout.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SubscriptionCancelPage />
    </main>
  );
}

