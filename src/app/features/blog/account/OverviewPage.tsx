import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@/app/components/blog/ui/Card";
import { auth } from "@/lib/auth";

/**
 * Přehledová stránka účtu (server component).
 * Provede server-side auth check a zobrazí základní obsah.
 * @returns {Promise<JSX.Element>} Přehled účtu.
 */
export default async function OverviewPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/account/auth/log-in");
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 my-8 mt-32 px-4">
      <div>
        <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark mb-4">
          Přehled účtu
        </h1>
        <p className="text-zinc-600 text-lg max-w-3xl leading-relaxed tracking-tight">
          Zde najdete přehled vašich aktivit a statistik.
        </p>
      </div>

      <Card className="p-8">
        <p className="text-zinc-600 tracking-tight">Přehledová stránka je ve vývoji.</p>
      </Card>
    </div>
  );
}

