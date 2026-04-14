import type { ReactNode } from "react";
import PageWrapper from "./components/PageWrapper";

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return <PageWrapper>{children}</PageWrapper>;
}
