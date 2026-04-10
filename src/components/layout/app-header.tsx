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
    <header className="flex flex-col gap-4 border-b bg-card/95 px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CompanyContext />
          {isEmployeeArea ? (
            <Link href="/requests/new" className="hidden md:block">
              <Button>Je veux poser un congé</Button>
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/help-center" className="hidden md:block">
            <Button variant="outline">Aide & FAQ</Button>
          </Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      <Breadcrumbs />
    </header>
  );
}
