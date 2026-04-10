import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <section className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Plateforme RH nouvelle génération
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Gestion des congés moderne, fiable et prête pour la production.</h1>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            Centralisez les demandes d’absence, les validations manager/RH, la conformité et l’audit organisation dans une interface claire et avancée.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login">
              <Button>
                Accéder à la plateforme
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Voir le tableau de bord</Button>
            </Link>
          </div>
        </section>

        <div className="grid gap-4">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              Workflows automatisés
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Soumission, approbation, annulation et suivi en temps réel.</p>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Sécurité & audit
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Historique traçable, rôles et séparation stricte des données.</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
