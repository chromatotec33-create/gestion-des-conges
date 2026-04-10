"use client";

import { Button } from "@/components/ui/button";

type ErrorProps = {
  readonly reset: () => void;
};

export default function DashboardError({ reset }: ErrorProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      <h2 className="text-lg font-semibold">Une erreur est survenue sur le dashboard.</h2>
      <p className="mt-2 text-sm">Veuillez réessayer. Si le problème persiste, contactez l’équipe RH/IT.</p>
      <Button className="mt-4" onClick={reset}>
        Réessayer
      </Button>
    </section>
  );
}
