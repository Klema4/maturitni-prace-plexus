import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import CompanyRegistrationForm from "./components/CompanyRegistrationForm";

type PageProps = {
  searchParams: Promise<{ reason?: string }>;
};

/**
 * CompanyRegistrationPage komponenta.
 * Server-side stránka pro firemní registraci do reklamní sítě.
 * Zajistí, že uživatel je přihlášen, a zobrazí klientský formulář.
 * @param {PageProps} props - Props včetně searchParams.
 * @returns Stránka s firemní registrací.
 */
export default async function CompanyRegistrationPage({
  searchParams,
}: PageProps) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/ads/auth");
  }

  const params = await searchParams;
  const showNoAccessMessage = params.reason === "no_org_access";

  return (
    <section className="mx-auto my-8 mt-24 flex max-w-5xl flex-col gap-8 px-4">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Firemní reklamy Plexus
          </p>
          <h1 className="newsreader text-4xl font-medium leading-none tracking-[-0.04em] text-dark lg:text-6xl">
            Registrace firmy do reklamní sítě
          </h1>
          <p className="max-w-2xl text-md font-medium leading-relaxed tracking-tight text-zinc-600">
            Pošlete žádost o zařazení své firmy do reklamní sítě Plexus. Po
            schválení získáte přístup ke kampaním, týmu i firemnímu přehledu.
          </p>
        </div>

        <div className="rounded-[28px] border border-black/6 bg-white/88 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Jak to funguje
          </p>
          <div className="mt-4 space-y-3 text-sm font-medium leading-relaxed tracking-tight text-zinc-600">
            <p>1. Vyplníte údaje o firmě a kontakt.</p>
            <p>2. Žádost zkontrolujeme a případně si vyžádáme doplnění.</p>
            <p>3. Po schválení se odemkne firemní prostor reklam.</p>
          </div>
        </div>
      </div>

      {showNoAccessMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm tracking-tight text-amber-800">
          Pro přístup k reklamnímu dashboardu potřebujete schválenou firemní
          registraci. Níže můžete zkontrolovat stav své žádosti nebo podat
          novou.
        </div>
      )}

      <CompanyRegistrationForm />
    </section>
  );
}
