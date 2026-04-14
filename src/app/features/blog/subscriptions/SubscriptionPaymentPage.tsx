"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/app/components/blog/NavbarClient";
import FooterClient from "@/app/components/blog/FooterClient";
import { Card } from "@/app/components/blog/ui/Card";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import { Loader2, CreditCard, Info } from "lucide-react";
import {
   submitPocPayment,
   type PocPaymentStatus,
} from "./api/subscriptionPayment.api";

type LocalStatus = PocPaymentStatus | null;

/** Testovací karty pro fiktivní PoC platební bránu (Stripe-style čísla) */
const TEST_CARDS = [
   {
      number: "4242 4242 4242 4242",
      result: "Platba prošla – předplatné 30 dní",
   },
   { number: "4000 0000 0000 0002", result: "Karta zamítnuta" },
   { number: "4000 0000 0000 9995", result: "Platba selhala" },
];

function getStatusMessage(status: LocalStatus) {
   if (status === "success") {
      return "Platba proběhla. Předplatné je aktivní na 30 dní. Za chvíli vás přesměrujeme na stránku předplatného…";
   }

   if (status === "declined") {
      return "Karta byla zamítnuta.";
   }

   if (status === "failed") {
      return "Platba selhala.";
   }

   return null;
}

function getStatusClassName(status: LocalStatus) {
   if (status === "success") {
      return "bg-green-50 border border-green-200 text-green-800";
   }

   if (status === "declined") {
      return "bg-amber-50 border border-amber-200 text-amber-800";
   }

   if (status === "failed") {
      return "bg-rose-50 border border-rose-200 text-rose-800";
   }

   return "";
}

export default function SubscriptionPaymentPage() {
   const router = useRouter();
   const [cardNumber, setCardNumber] = useState("");
   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState<LocalStatus>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (status === "success") {
         const t = setTimeout(() => {
            router.push("/account/subscription");
         }, 2500);
         return () => clearTimeout(t);
      }
   }, [status, router]);

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setLoading(true);
      setError(null);
      setStatus(null);

      try {
         const result = await submitPocPayment(cardNumber);
         setStatus(result.status);
      } catch (err: any) {
         setError(err?.message || "Nastala chyba při zpracování platby");
      } finally {
         setLoading(false);
      }
   };

   const statusMessage = getStatusMessage(status);

   return (
      <div className="min-h-screen">
         <div className="max-w-3xl mx-auto flex flex-col gap-6 my-8 mt-32 px-4">
            <div>
               <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark mb-3">
                  Předplatit Plexus
               </h1>
               <p className="text-zinc-600 text-lg leading-relaxed tracking-tight">
                  Zadejte testovací číslo karty a pokračujte.
               </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
               <Info size={20} className="text-primary shrink-0 mt-0.5" />
               <p className="text-sm text-zinc-600 tracking-tight">
                  Fiktivní platební brána (PoC) – žádná reálná platba se
                  neprovádí. Použijte testovací karty níže.
               </p>
            </div>

            <Card className="p-6">
               <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                     <CreditCard size={18} className="text-primary" />
                     <p className="text-sm font-semibold text-dark tracking-tight">
                        Platba kartou
                     </p>
                  </div>

                  <Input
                     variant="light"
                     label="Číslo karty"
                     placeholder="Např. 4242 4242 4242 4242"
                     value={cardNumber}
                     onChange={(e) => setCardNumber(e.target.value)}
                     disabled={loading}
                     required
                  />

                  <Button
                     type="submit"
                     variant="primary"
                     size="md"
                     disabled={loading}
                  >
                     {loading ? (
                        <>
                           <Loader2 size={16} className="animate-spin" />
                           Zpracovávám...
                        </>
                     ) : (
                        "Předplatit Plexus"
                     )}
                  </Button>
               </form>
            </Card>

            <Card className="p-6">
               <p className="text-sm font-semibold text-dark mb-3 tracking-tight">
                  Testovací karty
               </p>
               <div className="flex flex-col gap-2">
                  {TEST_CARDS.map((item) => (
                     <div
                        key={item.number}
                        className="rounded-md border border-zinc-200 px-3 py-2"
                     >
                        <p className="text-sm font-medium text-dark tracking-tight">
                           {item.number}
                        </p>
                        <p className="text-xs text-zinc-600 tracking-tight">
                           {item.result}
                        </p>
                     </div>
                  ))}
               </div>
            </Card>

            {statusMessage && (
               <div
                  className={`rounded-md p-4 text-sm font-medium tracking-tight ${getStatusClassName(status)}`}
               >
                  {statusMessage}
               </div>
            )}

            {error && (
               <div className="rounded-md p-4 text-sm font-medium tracking-tight bg-rose-50 border border-rose-200 text-rose-800">
                  {error}
               </div>
            )}
         </div>
      </div>
   );
}
