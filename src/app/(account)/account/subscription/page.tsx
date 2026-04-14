import { Suspense, type ReactElement } from "react";
import SubscriptionPage from "@/app/features/blog/account/SubscriptionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Předplatné",
};

/**
 * SubscriptionContent komponenta
 * Serverová komponenta, která načítá a renderuje obsah stránky předplatného.
 * Je oddělena kvůli použití ve Suspense boundary kvůli blokujícím datům (headers, session).
 * @returns {Promise<ReactElement>} Obsah stránky předplatného.
 */
async function SubscriptionContent(): Promise<ReactElement> {
  return <SubscriptionPage />;
}

/**
 * Stránka předplatného
 * Umožňuje uživatelům spravovat jejich předplatné.
 * Navbar a Footer zajišťuje AccountShell v layout.
 */
export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SubscriptionContent />
      </Suspense>
    </main>
  );
}
