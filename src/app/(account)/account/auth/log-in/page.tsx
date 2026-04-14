import LoginPage from '@/app/features/blog/auth/LoginPage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Přihlášení",
};

export default function Page() {
  return <LoginPage />;
}
