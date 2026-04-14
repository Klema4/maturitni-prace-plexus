"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/app/components/blog/ui/Container";
import { Card } from "@/app/components/blog/ui/Card";
import { Button } from "@/app/components/blog/ui/Button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { dashboardFetchOrThrow } from "@/utils/dashboardFetch";
import { buildCompanyAdsWorkspacePath } from "@/lib/utils/companyAdsRouting";

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Zpracovávám pozvánku...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Chybí platný token pozvánky.");
      return;
    }

    const acceptInvite = async () => {
      try {
        const response = await dashboardFetchOrThrow("/api/companies/ads/invitations/accept", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        setStatus("success");
        setMessage("Pozvánka byla úspěšně přijata. Nyní máte přístup k firemnímu dashboardu.");

        setTimeout(() => {
          router.push(buildCompanyAdsWorkspacePath(data.organizationId));
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Nepodařilo se přijmout pozvánku.");
      }
    };

    void acceptInvite();
  }, [token, router]);

  return (
    <Card className="mx-auto max-w-lg rounded-[30px] border-black/6 bg-white/88 p-8 text-center shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col items-center gap-6">
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin text-primary" size={48} />
            <div className="space-y-2">
              <h1 className="newsreader text-2xl font-medium tracking-tight text-dark">Přijímání pozvánky</h1>
              <p className="text-zinc-500">{message}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="text-emerald-500" size={48} />
            <div className="space-y-2">
              <h1 className="newsreader text-2xl font-medium tracking-tight text-dark">Skvělá zpráva!</h1>
              <p className="text-zinc-600">{message}</p>
              <p className="text-sm text-zinc-400">Za okamžik vás přesměrujeme do firemního prostoru...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="text-rose-500" size={48} />
            <div className="space-y-2">
              <h1 className="newsreader text-2xl font-medium tracking-tight text-dark">Chyba</h1>
              <p className="text-rose-600">{message}</p>
            </div>
            <Button href="/" variant="primary" className="mt-4">
              Zpět na hlavní stránku
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

export default function Page() {
  return (
    <Container size="sm" className="flex min-h-[68vh] items-center justify-center py-20">
      <Suspense fallback={
        <Card className="mx-auto max-w-lg rounded-[30px] border-black/6 bg-white/88 p-8 text-center shadow-[0_24px_60px_-42px_rgba(15,23,42,0.3)]">
          <Loader2 className="mx-auto animate-spin text-primary" size={48} />
          <p className="mt-4 text-zinc-500">Načítání...</p>
        </Card>
      }>
        <InviteAcceptContent />
      </Suspense>
    </Container>
  );
}
