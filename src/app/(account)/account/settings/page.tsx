import SettingsPage from "@/app/features/blog/account/SettingsPage";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Nastavení účtu",
};

/**
 * Stránka nastavení účtu.
 */
export default function Page() {
  return <SettingsPage />;
}
