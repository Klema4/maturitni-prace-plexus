export type SubscriptionFilterType = "all" | "active" | "expired";

export interface Subscription {
  userId: string;
  subscriptionId: string | null;
  startDate: string | null;
  endDate: string | null;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    image: string | null;
  };
}

export interface SubscriptionStats {
  active: number;
  expired: number;
  total: number;
}
