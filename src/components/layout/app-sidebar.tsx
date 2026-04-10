import Link from "next/link";
import type { Route } from "next";

type NavLink = {
  readonly href: Route;
  readonly label: string;
};

type NavSection = {
  readonly title: string;
  readonly links: readonly NavLink[];
};

const sections: readonly NavSection[] = [
  {
    title: "Opérations",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/calendar", label: "Calendrier" },
      { href: "/requests", label: "Mes demandes" },
      { href: "/approvals", label: "Validation manager" }
    ]
  },
  {
    title: "Administration RH",
    links: [
      { href: "/employees", label: "Employés" },
      { href: "/teams", label: "Équipes" },
      { href: "/settings/company", label: "Paramètres société" },
      { href: "/settings/policies", label: "Politiques congés" }
    ]
  },
  {
    title: "Contrôle",
    links: [
      { href: "/audit", label: "Audit logs" },
      { href: "/notifications", label: "Notifications" },
      { href: "/admin/users", label: "Rôles & permissions" }
    ]
  }
];

export function AppSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-card/70 p-5 lg:block">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Suite RH</p>
        <h2 className="text-lg font-semibold">Leave Operations</h2>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-sm text-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
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
