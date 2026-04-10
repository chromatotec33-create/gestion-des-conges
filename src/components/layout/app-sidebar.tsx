import Link from "next/link";
import type { Route } from "next";

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

export function AppSidebar() {
  return (
    <aside className="hidden w-80 shrink-0 border-r bg-card p-5 lg:block">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Progiciel RH Groupe</p>
        <h2 className="text-lg font-semibold">Gestion des congés</h2>
        <p className="mt-1 text-xs text-muted-foreground">Navigation simplifiée pour usage quotidien</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block rounded-md px-3 py-2 transition hover:bg-muted">
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    {link.helper ? <p className="text-xs text-muted-foreground">{link.helper}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
