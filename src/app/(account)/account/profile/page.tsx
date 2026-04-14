import ProfilePage from '@/app/features/blog/profile/ProfilePage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil",
};

/**
 * Profilová stránka uživatele.
 * Layout (Navbar, Footer, taby) je v account layout.
 */
export default function Page() {
  return <ProfilePage />;
}
