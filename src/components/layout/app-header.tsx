"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CompanyContext } from "@/components/layout/company-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const pathname = usePathname();
  const isEmployeeArea = ["/dashboard", "/requests", "/calendar"].some((prefix) => pathname.startsWith(prefix));

  return (
    <header className="sticky top-0 z-20 border-b border-white/20 bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <div className="glass-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CompanyContext />
            {isEmployeeArea ? (
              <Link href="/requests/new" className="hidden md:block">
                <Button>Je veux poser un congé</Button>
              </Link>
            ) : null}
          </div>

          <div className="hidden rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs text-muted-foreground md:flex">
            Workspace: Gestion des congés · prêt production
          </div>

          <div className="flex items-center gap-2">
            <Link href="/help-center" className="hidden md:block">
              <Button variant="outline">Aide & FAQ</Button>
            </Link>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        <div className="mt-3 border-t border-border/60 pt-3">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
}
