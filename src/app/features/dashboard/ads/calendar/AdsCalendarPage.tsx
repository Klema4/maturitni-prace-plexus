'use client'

import { Card } from "@/components/ui/dashboard/Card";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import Button from "@/components/ui/dashboard/Button";
import { CalendarRange, Building2, List } from "lucide-react";
import { clsx } from "clsx";
import { format, isSameMonth, isToday } from "date-fns";
import { cs } from "date-fns/locale";
import { useAdsCalendarPage } from "./hooks/useAdsCalendarPage";

/**
 * Stránka kalendáře reklam. Na desktopu zobrazuje měsíční přehled v mřížce 7xN,
 * na mobilu zobrazuje kompaktní časovou osu kampaní pro aktuální měsíc.
 * @returns {JSX.Element} Komponenta stránky kalendáře reklam.
 */
export default function AdCalendar() {
  const {
    loading,
    error,
    now,
    calendarDays,
    campaignsByDay,
    upcomingCampaigns,
    timelineCampaigns,
    getTimelineBarStyle,
  } = useAdsCalendarPage();

  const weekDays = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Kalendář reklam</Heading>
          <Paragraph color="muted">{error}</Paragraph>
        </header>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Kalendář reklam</Heading>
        <Paragraph>Získej časový přehled o reklamním prostoru.</Paragraph>
      </header>
      <section className="mt-4">
        <QuickOptions
          options={[
            { label: 'Kampaně', icon: List, link: '/dashboard/ads/campaigns' },
          ]}
        />
        <div className="mt-4 p-1">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <CalendarRange size={24} className="text-blue-400" />
              <Heading variant="h3">
                {format(now, 'LLLL yyyy', { locale: cs })}
              </Heading>
            </div>
            {loading ? (
              <div className="flex min-h-[320px] w-full items-center justify-center">
                <Paragraph color="muted">Načítání kampaní...</Paragraph>
              </div>
            ) : (
              <>
                <div className="md:hidden">
                  {timelineCampaigns.length === 0 ? (
                    <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/50 px-4 py-6">
                      <Paragraph color="muted">V tomto měsíci nejsou žádné kampaně.</Paragraph>
                    </div>
                  ) : (
                    <div className="relative pl-4">
                      <div className="absolute left-2.5 top-8 h-[calc(100%-5rem)] w-px bg-zinc-800" />
                      <div className="space-y-3">
                        {timelineCampaigns.map((campaign) => (
                          <div
                            key={campaign.id}
                            className="relative rounded-lg border border-zinc-800/70 bg-zinc-900/60 p-3"
                          >
                            <span className="absolute -left-[11px] top-5 h-2.5 w-2.5 rounded-full bg-zinc-300" />
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold tracking-tight text-zinc-100">
                                  {campaign.name}
                                </p>
                                <p className="truncate text-xs font-medium tracking-tight text-zinc-400">
                                  {campaign.organization?.name ?? "Neznámá organizace"}
                                </p>
                              </div>
                              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold tracking-tight text-zinc-300">
                                {format(new Date(campaign.startingAt), "d.M")} - {format(new Date(campaign.endingAt), "d.M")}
                              </span>
                            </div>
                            <div className="mt-2 rounded-sm bg-zinc-800 p-0.5">
                              <div className="h-1.5 rounded-sm bg-zinc-700">
                                <div
                                  className="h-1.5 rounded-sm bg-zinc-200"
                                  style={getTimelineBarStyle(campaign)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden w-full p-0.5 overflow-x-auto md:block">
                  <div className="grid min-w-[420px] grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="rounded-md bg-zinc-900/60 px-2 py-2 text-center text-xs font-medium tracking-tight uppercase text-zinc-500"
                      >
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day) => {
                      const key = format(day, 'yyyy-MM-dd');
                      const dayCampaigns = campaignsByDay.get(key) ?? [];
                      const isCurrentMonth = isSameMonth(day, now);
                      const isTodayDate = isToday(day);
                      return (
                        <div
                          key={key}
                          className={clsx(
                            'min-h-[88px] rounded-md border border-zinc-800/50 bg-zinc-900/40 p-2',
                            !isCurrentMonth && 'opacity-55',
                            isTodayDate && 'border-white!',
                          )}
                        >
                          <span
                            className={clsx(
                              'inline-flex h-7 w-7 cursor-default items-center justify-center rounded-full text-sm tracking-tight',
                              isTodayDate && 'bg-white font-semibold text-zinc-900',
                              isCurrentMonth && !isTodayDate && 'text-zinc-300',
                              !isCurrentMonth && 'text-zinc-600',
                            )}
                          >
                            {format(day, 'd')}
                          </span>
                          <div className="mt-1 space-y-1">
                            {dayCampaigns.slice(0, 3).map((c) => (
                              <div
                                key={c.id}
                                className="cursor-pointer truncate rounded-sm bg-zinc-800/80 px-2 py-1 text-xs text-zinc-200 transition-colors hover:bg-zinc-700/80"
                                title={`${c.name} – ${c.organization?.name ?? ''}`}
                              >
                                {c.name}
                              </div>
                            ))}
                            {dayCampaigns.length > 3 && (
                              <div className="text-xs tracking-tight text-zinc-500">
                                +{dayCampaigns.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-6">
          <Heading variant="h3">Nadcházející kampaně</Heading>
          <Paragraph size="small" color="muted" className="mt-1">
            Nejbližších 6 kampaní seřazených podle data zahájení
          </Paragraph>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {upcomingCampaigns.length === 0 && !loading ? (
              <Card padding="default">
                <Paragraph color="muted">Žádné nadcházející kampaně</Paragraph>
              </Card>
            ) : (
              upcomingCampaigns.map((c) => (
                <Card key={c.id} className="p-4!" padding="default">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-900/50 flex items-center justify-center">
                        <Building2 size={20} className="text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <Heading variant="h5">{c.organization?.name ?? '—'} – {c.name}</Heading>
                        <Paragraph size="small">
                          {format(new Date(c.startingAt), 'd.M.yyyy', { locale: cs })} - {format(new Date(c.endingAt), 'd.M.yyyy', { locale: cs })}
                        </Paragraph>
                      </div>
                    </div>
                    <Button href="/dashboard/ads/campaigns" variant="secondary">
                      Detail
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
