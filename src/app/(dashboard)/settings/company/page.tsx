import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

export default function CompanySettingsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Paramètres organisation</h2>
          <p className="page-subtitle">Configuration globale unique de l’application (mode mono-entité logique).</p>
        </div>
        <Badge>Règles globales</Badge>
      </div>

      <Card>
        <CardTitle>Informations légales de référence</CardTitle>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Chromatotec" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="3248" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Europe/Paris" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="FR" />
          <div className="md:col-span-2 flex justify-end">
            <Button type="button">Sauvegarder</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
