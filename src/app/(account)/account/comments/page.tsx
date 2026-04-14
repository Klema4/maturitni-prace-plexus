import MyCommentsPage from '@/app/features/blog/account/MyCommentsPage';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moje komentáře",
};

/**
 * Stránka Moje komentáře.
 */
export default function Page() {
  return <MyCommentsPage />;
}
