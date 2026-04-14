import type { ReactNode } from "react";

/**
 * PublicDashboardLayout
 * Veřejný layout pro stránky pod `/dashboard/*`, které nesmí vyžadovat přihlášení
 * (např. `/dashboard/auth`).
 *
 * @param {Object} props - Props layoutu.
 * @param {ReactNode} props.children - Obsah stránky.
 * @returns {JSX.Element} Layout bez access gate.
 */
export default function PublicDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

