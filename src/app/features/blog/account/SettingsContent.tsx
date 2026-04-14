'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/blog/ui/Button';
import { Loader2 } from 'lucide-react';
import ProfileInfoCard from '@/app/features/blog/profile/components/ProfileInfoCard';
import PasskeyCard from '@/app/features/blog/auth/components/PasskeyCard';
import { signOut } from '@/app/features/blog/auth/api/auth.api';
import {
  getCurrentUser,
  checkUserHasPassword,
  getCurrentSubscriptionStatus,
} from '@/app/features/blog/profile/api/profile.api';
import type { SubscriptionStatus } from '@/app/features/blog/profile/types';

/**
 * Klientská část stránky nastavení.
 * Načítá uživatelská data, stav hesla a předplatného, zobrazuje ProfileInfoCard, PasskeyCard a odhlášení.
 */
export default function SettingsContent() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
    createdAt: Date;
  } | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userResult = await getCurrentUser();
      if (userResult.user) {
        setUserData({
          id: userResult.user.id,
          email: userResult.user.email,
          createdAt: userResult.user.createdAt
            ? new Date(userResult.user.createdAt)
            : new Date(),
        });
      }

      const passwordResult = await checkUserHasPassword();
      setHasPassword(passwordResult.hasPassword || false);

      try {
        const subscriptionResult = await getCurrentSubscriptionStatus();
        setSubscriptionStatus({
          hasSubscription: subscriptionResult.hasSubscription,
          isActive: subscriptionResult.isActive,
          startDate: subscriptionResult.startDate ? new Date(subscriptionResult.startDate) : null,
          endDate: subscriptionResult.endDate ? new Date(subscriptionResult.endDate) : null,
        });
      } catch {
        setSubscriptionStatus(null);
      }
    } catch {
      setUserData(null);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/account/auth/log-in');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary animate-spin" size={32} />
          <p className="text-zinc-600 tracking-tight">Načítám nastavení...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 my-8 px-4">
      <div>
        <h1 className="newsreader text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-dark">
          Nastavení
        </h1>
        <p className="text-zinc-600 text-base font-medium max-w-3xl leading-relaxed tracking-tight">
          Spravujte email, heslo, předplatné a přihlašovací metody.
        </p>
      </div>

      <ProfileInfoCard
        email={userData.email}
        userId={userData.id}
        createdAt={userData.createdAt}
        hasPassword={hasPassword}
        subscriptionStatus={subscriptionStatus}
      />
      <PasskeyCard />
      <div className="pt-4 border-t border-zinc-200 flex justify-end">
        <Button
          type="button"
          variant="subtle"
          size="sm"
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          Odhlásit se
        </Button>
      </div>
    </div>
  );
}
