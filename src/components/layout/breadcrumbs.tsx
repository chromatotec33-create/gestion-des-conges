"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  calendar: "Calendrier",
  requests: "Mes demandes",
  approvals: "Validation manager",
  employees: "Employés",
  teams: "Équipes",
  settings: "Paramètres",
  company: "Société",
  policies: "Politiques",
  audit: "Audit logs",
  notifications: "Notifications",
  profile: "Profil",
  admin: "Admin",
  users: "Utilisateurs"
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Fil d'ariane" className="text-xs text-muted-foreground">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="hover:text-foreground">
            Accueil
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              <Link href={href} className="hover:text-foreground">
                {labelMap[segment] ?? segment}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
