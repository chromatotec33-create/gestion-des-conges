"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Profil utilisateur</h2>
        <p className="page-subtitle">Informations personnelles et préférences de notification.</p>
      </div>
      <Card>
        <CardTitle>Informations</CardTitle>
        <form
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setFeedback("Profil mis à jour avec succès.");
          }}
        >
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Admin" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="admin@admin.com" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Français" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Europe/Paris" />
          <div className="md:col-span-2 flex items-center justify-between gap-2">
            {feedback ? <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{feedback}</p> : <span />}
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
