export interface AdminCampaign {
  id: string;
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  bannerImageUrl?: string | null;
  startingAt: string | Date;
  endingAt: string | Date;
  viewCount?: number;
  organizationId?: string;
  organization?: {
    id?: string;
    name: string;
    imageUrl?: string;
  };
}

export interface AdminOrganization {
  id: string;
  name: string;
  imageUrl: string;
  websiteUrl: string | null;
  email: string;
  phone: string;
  location: string;
  ico: string | null;
  verified?: boolean;
  activeCampaignsCount?: number;
  totalCampaignsCount?: number;
}

export type AdminRegistrationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface AdminOrganizationApplication {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  ico: string | null;
  status: AdminRegistrationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}
