'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/blog/ui/Card";
import { Button } from "@/app/components/blog/ui/Button";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

type CancelState = "idle" | "loading" | "success" | "error";

/**
 * SubscriptionCancelPage
 * Stránka pro zrušení / vypnutí automatického obnovení předplatného.
 * V rámci PoC simulace po potvrzení zavolá API a zruší aktuální předplatné uživatele.
 * @returns Komponenta stránky pro zrušení předplatného.
 */
export default function SubscriptionCancelPage() {
  const router = useRouter();
  const [state, setState] = useState<CancelState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/subscription/me", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || "Nepodařilo se zrušit předplatné. Zkuste to prosím znovu."
        );
      }

      setState("success");

      // Po krátké chvíli přesměrujeme zpět na přehled předplatného
      setTimeout(() => {
        router.push("/account/subscription");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      setError(err?.message || "Nepodařilo se zrušit předplatné.");
      setState("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 my-8 mt-32 px-4">
      <div>
        <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark mb-3">
          Správa předplatného
        </h1>
        <p className="text-zinc-600 text-md font-medium leading-relaxed tracking-tight">
          Správa vašeho předplatného a jeho zrušení.
        </p>
      </div>

      <Card className="p-6 border-none!">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="text-sm font-semibold text-amber-700 tracking-tight">
              Zrušení předplatného
            </p>
            <p className="text-sm text-zinc-600 font-medium tracking-tight mt-1">
              Zrušením předplatného dojde k zrušení vašeho aktuálního předplatného. Do konce tohoto období máte stále přístup k prémiovému obsahu.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="subtleDanger"
            size="md"
            className="tracking-tight cursor-pointer"
            disabled={state === "loading" || state === "success"}
            onClick={handleCancel}
          >
            {state === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Ruším předplatné...
              </>
            ) : (
              "Zrušit automatické obnovení předplatného"
            )}
          </Button>

          {state === "success" && (
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center gap-2 text-sm text-emerald-800 tracking-tight">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>
                Předplatné bylo úspěšně zrušeno. Za chvíli budete přesměrováni zpět na přehled
                předplatného.
              </span>
            </div>
          )}

          {state === "error" && error && (
            <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 tracking-tight">
              {error}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

