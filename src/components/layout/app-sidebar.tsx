"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Bell, CalendarClock, ClipboardCheck, FileClock, HelpCircle, LayoutDashboard, Settings2, ShieldCheck, Users, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  readonly href: Route;
  readonly label: string;
  readonly helper?: string;
};

type NavSection = {
  readonly title: string;
  readonly links: readonly NavLink[];
};

const sections: readonly NavSection[] = [
  {
    title: "Espace salarié",
    links: [
      { href: "/dashboard", label: "Mon accueil", helper: "Solde, prochaines absences, actions rapides" },
      { href: "/requests", label: "Mes congés", helper: "Voir, modifier ou annuler mes demandes" },
      { href: "/calendar", label: "Planning", helper: "Visualiser les absences" },
      { href: "/help-center", label: "Centre d'aide", helper: "FAQ et explications simples" },
      { href: "/profile", label: "Mon profil", helper: "Informations personnelles" }
    ]
  },
  {
    title: "Espace manager",
    links: [
      { href: "/approvals", label: "Valider les demandes", helper: "Décisions rapides équipe" },
      { href: "/teams", label: "Planning équipe", helper: "Disponibilité et conflits" }
    ]
  },
  {
    title: "Espace RH & administration",
    links: [
      { href: "/employees", label: "Fiches salariés" },
      { href: "/settings/company", label: "Paramètres société" },
      { href: "/settings/policies", label: "Paramètres congés" },
      { href: "/admin/users", label: "Rôles et accès" },
      { href: "/audit", label: "Journal des actions" },
      { href: "/notifications", label: "Notifications RH" }
    ]
  }
];

const iconByPath: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/requests": FileClock,
  "/calendar": CalendarClock,
  "/help-center": HelpCircle,
  "/profile": UsersRound,
  "/approvals": ClipboardCheck,
  "/teams": Users,
  "/employees": Users,
  "/settings/company": Settings2,
  "/settings/policies": Settings2,
  "/admin/users": ShieldCheck,
  "/audit": ShieldCheck,
  "/notifications": Bell
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-80 shrink-0 border-r border-white/20 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-950/50 lg:block">
      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white/40 to-transparent p-4 dark:from-primary/20 dark:via-slate-900/40">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Progiciel RH Groupe</p>
        <h2 className="text-lg font-semibold">Gestion des congés</h2>
        <p className="mt-1 text-xs text-muted-foreground">Interface modernisée pour pilotage équipes</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = iconByPath[link.href] ?? LayoutDashboard;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group block rounded-xl border px-3 py-2 transition",
                        isActive
                          ? "border-primary/30 bg-primary/10 shadow-sm"
                          : "border-transparent hover:border-border/70 hover:bg-muted/70"
                      )}
                    >
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        {link.label}
                      </p>
                      {link.helper ? <p className="ml-6 text-xs text-muted-foreground">{link.helper}</p> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
