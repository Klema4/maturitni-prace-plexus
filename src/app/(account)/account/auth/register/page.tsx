import RegisterPage from '@/app/features/blog/auth/RegisterPage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrace",
};

export default function Page() {
  return <RegisterPage />;
}
