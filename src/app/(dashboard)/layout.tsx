import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QueryProvider } from "@/components/layout/query-provider";

type DashboardLayoutProps = {
  readonly children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <QueryProvider>
      <DashboardShell>{children}</DashboardShell>
    </QueryProvider>
  );
}
