import ChangeEmailPage from '@/app/features/blog/auth/ChangeEmailPage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Změna e-mailu",
};

export default function Page() {
  return <ChangeEmailPage />;
}
