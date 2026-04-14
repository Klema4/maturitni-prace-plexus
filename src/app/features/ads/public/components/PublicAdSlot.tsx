import { getPublicAdCampaign } from '@/app/features/ads/public/api/publicAds.api';
import AdCampaignCard from '@/app/features/ads/public/components/AdCampaignCard';
import type { PublicAdCampaign } from '@/app/features/ads/public/types';

interface PublicAdSlotProps {
  slot?: string;
  className?: string;
}

export default async function PublicAdSlot({
  slot = 'default',
  className,
}: PublicAdSlotProps) {
  const campaign = await getPublicAdCampaign(slot);

  if (!campaign) {
    return null;
  }

  return <AdCampaignCard campaign={campaign} className={className} interactive />;
}
