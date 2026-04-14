"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { listAdminCampaigns } from "../../api/ads.api";
import type { AdminCampaign } from "../../types";

export function useAdsCalendarPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        setError(null);
        setCampaigns(await listAdminCampaigns());
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Chyba při načítání",
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchCampaigns();
  }, []);

  const monthStart = useMemo(() => startOfMonth(now), [now]);
  const monthEnd = useMemo(() => endOfMonth(now), [now]);
  const calendarStart = useMemo(
    () => startOfWeek(monthStart, { weekStartsOn: 1 }),
    [monthStart],
  );
  const calendarEnd = useMemo(
    () => endOfWeek(monthEnd, { weekStartsOn: 1 }),
    [monthEnd],
  );
  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarEnd, calendarStart],
  );

  const campaignsByDay = useMemo(() => {
    const map = new Map<string, AdminCampaign[]>();

    for (const campaign of campaigns) {
      const start = new Date(campaign.startingAt);
      const end = new Date(campaign.endingAt);
      let day = new Date(calendarStart);

      while (day <= calendarEnd) {
        const dayCopy = new Date(day);
        if (
          isWithinInterval(dayCopy, { start, end }) &&
          isSameMonth(dayCopy, now)
        ) {
          const key = format(dayCopy, "yyyy-MM-dd");
          const currentItems = map.get(key) ?? [];
          currentItems.push(campaign);
          map.set(key, currentItems);
        }

        day = addDays(day, 1);
      }
    }

    return map;
  }, [calendarEnd, calendarStart, campaigns, now]);

  const upcomingCampaigns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return campaigns
      .filter((campaign) => new Date(campaign.startingAt) >= today)
      .sort(
        (leftCampaign, rightCampaign) =>
          new Date(leftCampaign.startingAt).getTime() -
          new Date(rightCampaign.startingAt).getTime(),
      )
      .slice(0, 6);
  }, [campaigns]);

  const timelineCampaigns = useMemo(
    () =>
      campaigns
        .filter((campaign) => {
          const start = new Date(campaign.startingAt);
          const end = new Date(campaign.endingAt);
          return end >= monthStart && start <= monthEnd;
        })
        .sort(
          (leftCampaign, rightCampaign) =>
            new Date(leftCampaign.startingAt).getTime() -
            new Date(rightCampaign.startingAt).getTime(),
        ),
    [campaigns, monthEnd, monthStart],
  );

  const getTimelineBarStyle = useCallback(
    (campaign: AdminCampaign) => {
      const monthStartTime = monthStart.getTime();
      const monthEndTime = monthEnd.getTime();
      const start = new Date(campaign.startingAt).getTime();
      const end = new Date(campaign.endingAt).getTime();

      const clamp = (value: number, min: number, max: number) =>
        Math.min(max, Math.max(min, value));

      const normalizedStart = clamp(start, monthStartTime, monthEndTime);
      const normalizedEnd = clamp(end, monthStartTime, monthEndTime);
      const monthDuration = Math.max(1, monthEndTime - monthStartTime);
      const left = ((normalizedStart - monthStartTime) / monthDuration) * 100;
      const width = Math.max(
        2,
        ((Math.max(normalizedEnd, normalizedStart) - normalizedStart) /
          monthDuration) *
          100,
      );

      return {
        marginLeft: `${left}%`,
        width: `${Math.min(100 - left, width)}%`,
      };
    },
    [monthEnd, monthStart],
  );

  return {
    loading,
    error,
    now,
    calendarDays,
    campaignsByDay,
    upcomingCampaigns,
    timelineCampaigns,
    getTimelineBarStyle,
  };
}
