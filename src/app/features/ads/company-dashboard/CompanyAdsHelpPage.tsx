import { PageSection, Panel } from "@/app/features/ads/company-dashboard/components";
import { CircleHelp, Mail, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";
export default function Page() {
  const faqs = [
    {
      question: "Jak vytvořím novou kampaň?",
      answer: "Přejděte do sekce Kampaně a vyplňte název, cílovou adresu a termín."
    },
    {
      question: "Kdo může spravovat reklamy?",
      answer: "Vlastník a správce. Role pro náhled má přístup pouze ke čtení."
    },
    {
      question: "Jak pozvám nového člena týmu?",
      answer: "V sekci Tým zadejte email, vyberte roli a odešlete pozvánku."
    },
    {
      question: "Kdy se moje reklama začne zobrazovat?",
      answer: "Automaticky v nastaveném čase, pokud je firma aktivní a kampaň běží."
    }
  ];

  return (
      <div className="space-y-10">
        <PageSection
          title="Pomoc pro firemní reklamy"
          description="Rychlé odpovědi na časté otázky a cesty, kudy se dovolat podpory."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Časté dotazy" description="Rychlé odpovědi na nejčastější otázky.">
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-0 rounded-lg border border-zinc-200 bg-zinc-100 p-4">
                  <p className="font-semibold tracking-tight text-dark">{faq.question}</p>
                  <p className="text-sm tracking-tight font-medium leading-relaxed text-zinc-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Kontaktujte nás" description="Nenašli jste, co jste hledali?">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-4">
                  <Mail className="mb-3 text-primary" size={24} />
                  <p className="font-semibold tracking-tight text-dark">Emailová podpora</p>
                  <p className="mb-4 text-xs text-zinc-500">Odpovídáme do 24 hodin</p>
                  <Button variant="outline" size="sm" className="w-full" href="mailto:support@plexus.cz">
                    Napsat email
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel title="Dokumentace" description="Podrobné návody a pravidla.">
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg p-4 h-12! text-left" href="/ads/terms-of-service">
                  <BookOpen size={18} className="text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark">Pravidla inzerce</p>
                    <p className="text-xs text-zinc-500">Co je a není povoleno v reklamách</p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg p-4 h-12! text-left" href="/ads/pricing">
                  <CircleHelp size={18} className="text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark">Ceník a balíčky</p>
                    <p className="text-xs text-zinc-500">Přehled možností propagace</p>
                  </div>
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
  );
}
