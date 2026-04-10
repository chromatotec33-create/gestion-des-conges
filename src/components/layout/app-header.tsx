import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function AppHeader() {
  return (
    <header className="flex flex-col gap-4 border-b bg-card/70 px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CompanySwitcher />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      <Breadcrumbs />
    </header>
  );
}
