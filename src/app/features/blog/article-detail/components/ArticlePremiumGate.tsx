import { ArrowUpRight, Crown, HandCoins } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";

export default function ArticlePremiumGate() {
  return (
    <section className="p-4 py-12 rounded-xl bg-amber-600/10 border border-amber-600/25">
      <div className="space-y-4 text-center flex flex-col items-center">
        <div className="space-y-2">
          <h2 className="newsreader text-3xl font-medium tracking-tighter text-zinc-950">
            Tento článek je dostupný jen pro předplatitele
          </h2>
          <p className="max-w-xl text-base leading-7 tracking-tight text-zinc-600">
            Aktivujte si předplatné a odemkněte prémiové články bez reklam a bez omezení.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/account/subscription/payment" variant="primary" size="md">
            Získat předplatné nyní <HandCoins size={16} />
          </Button>
          <Button href="/account/auth/log-in" variant="default" size="md">
            Přihlásit se <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
