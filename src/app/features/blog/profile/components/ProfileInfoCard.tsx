'use client';

import Link from 'next/link';
import { Mail, Calendar, Lock, Eye, EyeOff, ArrowRight, CreditCard, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import type { SubscriptionStatus } from '../types';

/**
 * Props pro `ProfileInfoCard`.
 */
interface ProfileInfoCardProps {
  email: string;
  userId: string;
  createdAt: Date;
  hasPassword: boolean;
  subscriptionStatus: SubscriptionStatus | null;
}

/**
 * Karta s profilovými informacemi.
 * @param {ProfileInfoCardProps} props - Vlastnosti komponenty.
 * @returns {JSX.Element} ProfileInfoCard.
 */
export default function ProfileInfoCard({
  email,
  userId,
  createdAt,
  hasPassword,
  subscriptionStatus,
}: ProfileInfoCardProps) {
  const hasActiveSubscription =
    subscriptionStatus?.hasSubscription && subscriptionStatus.isActive;
  const subscriptionEndDate = subscriptionStatus?.endDate ?? null;

  const subscriptionLinkHref = hasActiveSubscription
    ? "/account/subscription/cancel"
    : "/account/subscription/payment";

  const subscriptionLinkLabel = hasActiveSubscription ? "Spravovat" : "Otevřít";

  return (
    <div className="w-full p-6 bg-white/75 rounded-xl">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="newsreader text-2xl lg:text-3xl font-medium tracking-tighter leading-tight text-dark">Profilové informace</h2>
        <p className="text-zinc-600 text-sm font-medium max-w-3xl leading-relaxed tracking-tight">Spravujte své profilové informace a nastavení.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Mail size={20} className="text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-md text-dark font-semibold tracking-tight">Email</p>
              <p className="text-sm text-zinc-700 font-medium tracking-tight">{email}</p>
            </div>
          </div>
          <Link 
            href="/account/auth/change-email"
            className="text-primary hover:text-primary/80 transition-colors cursor-pointer flex items-center gap-1 text-sm font-medium tracking-tight"
          >
            Změnit
            <ArrowRight size={14} />
          </Link>
        </div>

        {hasPassword && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Lock size={20} className="text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-md text-dark font-semibold tracking-tight">Heslo</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-700 font-medium tracking-tight font-mono">
                    {'••••••••'}
                  </p>
                </div>
              </div>
            </div>
            <Link 
              href="/account/auth/change-password"
              className="text-primary hover:text-primary/80 transition-colors cursor-pointer flex items-center gap-1 text-sm font-medium tracking-tight"
            >
              Změnit
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-md text-dark font-semibold tracking-tight">Vytvoření účtu</p>
            <p className="text-sm text-zinc-700 font-medium tracking-tight">
              {format(createdAt, 'dd.MM.yyyy HH:mm', { locale: cs })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <CreditCard size={20} className="text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-md text-dark font-semibold tracking-tight">Předplatné Plexus</p>
              {hasActiveSubscription ? (
                <p className="text-sm text-emerald-700 font-medium tracking-tight flex items-center gap-1">
                  <BadgeCheck size={16} className="shrink-0" />
                  Aktivní předplatné
                  {subscriptionEndDate && (
                    <span className="text-zinc-700">
                      {' '}
                      do{' '}
                      <strong className="text-dark">
                        {format(subscriptionEndDate, 'd. MMMM yyyy', { locale: cs })}
                      </strong>
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-zinc-700 font-medium tracking-tight">
                  Nemáte aktivní předplatné. Otevřete testovací platbu a vyzkoušejte Plexus Premium.
                </p>
              )}
            </div>
          </div>
          <Link
            href={subscriptionLinkHref}
            className="text-primary hover:text-primary/80 transition-colors cursor-pointer flex items-center gap-1 text-sm font-medium tracking-tight"
          >
            {subscriptionLinkLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
