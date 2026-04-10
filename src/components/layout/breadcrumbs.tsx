"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Mon accueil",
  calendar: "Planning",
  requests: "Mes congés",
  approvals: "Validation manager",
  employees: "Fiches salariés",
  teams: "Équipes",
  settings: "Paramètres",
  company: "Société",
  policies: "Congés",
  audit: "Journal des actions",
  notifications: "Notifications",
  profile: "Mon profil",
  admin: "Administration",
  users: "Rôles et accès"
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Fil d'ariane" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/dashboard" className="rounded-md px-1.5 py-1 hover:bg-muted hover:text-foreground">
            Accueil
          </Link>
        </li>
        {segments.map((segment, index) => {
          const key = `${segment}-${index}`;
          return (
            <li key={key} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="rounded-md px-1.5 py-1 hover:bg-muted hover:text-foreground">{labelMap[segment] ?? segment}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
