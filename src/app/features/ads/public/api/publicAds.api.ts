import { unstable_noStore as noStore } from 'next/cache';
import { getPublicAdCampaignService } from '@/lib/services/adsService';
import type { PublicAdCampaign } from '@/app/features/ads/public/types';

function toPublicAdCampaign(
  campaign: Awaited<ReturnType<typeof getPublicAdCampaignService>>,
): PublicAdCampaign | null {
  if (!campaign) {
    return null;
  }

  return {
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    bannerImageUrl: campaign.bannerImageUrl,
    bannerUrl: campaign.bannerUrl,
    organization: {
      id: campaign.organization.id,
      name: campaign.organization.name,
      imageUrl: campaign.organization.imageUrl,
      websiteUrl: campaign.organization.websiteUrl,
    },
  };
}

export async function getPublicAdCampaign(
  slot: string = 'default',
): Promise<PublicAdCampaign | null> {
  noStore();

  const campaign = await getPublicAdCampaignService(slot);
  return toPublicAdCampaign(campaign);
}
