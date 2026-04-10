import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default function CompanySettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Paramètres société</h2>
        <p className="page-subtitle">Configuration multi-entité: Chromatotec, Airmotec, JPA Technologies.</p>
      </div>
      <Card>
        <CardTitle>Informations légales</CardTitle>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Chromatotec" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="3248" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="Europe/Paris" />
          <input className="rounded-md border bg-card px-3 py-2 text-sm" defaultValue="FR" />
          <div className="md:col-span-2 flex justify-end">
            <Button>Sauvegarder</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
