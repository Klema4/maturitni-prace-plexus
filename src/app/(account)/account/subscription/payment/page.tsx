import SubscriptionPaymentPage from '@/app/features/blog/subscriptions/SubscriptionPaymentPage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platba předplatného",
};

export default function Page() {
  return <SubscriptionPaymentPage />;
}
