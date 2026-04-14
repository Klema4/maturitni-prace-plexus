import AdCampaignCard from "@/app/features/ads/public/components/AdCampaignCard";
import type { PublicAdCampaign } from "@/app/features/ads/public/types";

interface InlineAdBlockProps {
  campaign: PublicAdCampaign | null;
}

export default function InlineAdBlock({ campaign }: InlineAdBlockProps) {
  if (!campaign) {
    return null;
  }

  return <AdCampaignCard campaign={campaign} />;
}
