export interface PublicAdCampaign {
  id: string;
  name: string;
  description: string | null;
  bannerImageUrl: string | null;
  bannerUrl: string | null;
  organization: {
    id: string;
    name: string;
    imageUrl: string;
    websiteUrl: string | null;
  };
}
