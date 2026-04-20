import ResetPasswordRequestPage from '@/app/features/blog/auth/ResetPasswordRequestPage';
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Obnova hesla",
};

export default function Page() {
  return <ResetPasswordRequestPage />;
}
