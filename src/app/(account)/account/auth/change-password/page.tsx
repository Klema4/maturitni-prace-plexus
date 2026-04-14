import ChangePasswordPage from '@/app/features/blog/auth/ChangePasswordPage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Změna hesla",
};

export default function Page() {
  return <ChangePasswordPage />;
}
