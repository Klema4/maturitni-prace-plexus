import {
  PageSection,
  Panel,
  EmptyState,
} from "@/app/features/ads/company-dashboard/components";
import formatDateServer from "@/utils/formatDateServer";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";

/**
 * Stránka kalendáře reklam pro firmy.
 * Zobrazuje časovou osu kampaní pro vybranou firmu.
 * @return {JSX.Element} Funkce stránky kalendáře.
 */
export default function Page() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
      <div className="space-y-10">
        <PageSection
          title="Časová osa vašich reklam"
          description="Přehledné zobrazení plánovaných a běžících kampaní v čase."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full px-3">
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-semibold tracking-tight text-dark">
                Dnes – {formatDateServer(days[days.length - 1])}
              </span>
              <Button variant="outline" size="sm" className="rounded-full px-3">
                <ChevronRight size={16} />
              </Button>
            </div>
          }
        />

        <Panel
          title="Kalendář na příštích 30 dní"
          description="Časová osa kampaní v následujícím měsíci."
        >
          <div className="overflow-x-auto rounded-2xl border border-black/6 bg-zinc-50/60 p-4">
            <div className="min-w-[1200px] space-y-4">
              <div className="flex border-b border-zinc-200 pb-4">
                <div className="w-48 shrink-0 text-sm font-medium tracking-tight text-zinc-500">
                  Kampaň
                </div>
                <div className="flex flex-1">
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={`flex flex-1 flex-col items-center gap-1 border-l border-zinc-200 text-[10px] font-bold ${i === 0 ? "text-primary" : "text-zinc-400"}`}
                    >
                      <span>
                        {day
                          .toLocaleDateString("cs-CZ", { weekday: "short" })
                          .toUpperCase()}
                      </span>
                      <span>{day.getDate()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 py-4">
                {/* Rezervováno pro reálná data z kontextu nebo API */}
                <EmptyState
                  title="Žádné aktivní kampaně pro toto období"
                  description="Vytvořte novou kampaň v sekci Kampaně, aby se zobrazila v kalendáři."
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>
  );
}
