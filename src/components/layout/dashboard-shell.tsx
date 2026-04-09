import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DashboardShellProps = {
  readonly children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-border bg-white/80 backdrop-blur dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">SaaS RH Enterprise</p>
            <h1 className="text-xl font-semibold">Gestion des congés</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost">Calendrier</Button>
            </Link>
            <Button>Nouvelle demande</Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
