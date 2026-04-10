import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Profil utilisateur</h2>
        <p className="page-subtitle">Informations personnelles et préférences de notification.</p>
      </div>
      <Card>
        <CardTitle>Informations</CardTitle>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Admin" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="admin@admin.com" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Français" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Europe/Paris" />
          <div className="md:col-span-2 flex justify-end">
            <Button>Enregistrer</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
