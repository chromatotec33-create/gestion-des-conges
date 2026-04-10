import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

export default function PoliciesPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Politiques congés</h2>
          <p className="page-subtitle">Acquisition, report, expiration et ordre de consommation globaux.</p>
        </div>
        <Badge>Configuration unique</Badge>
      </div>
      <Card>
        <CardTitle>Paramètres de calcul</CardTitle>
        <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm">
            Mode acquisition
            <select className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm">
              <option>Mode A (2.0833 / mois)</option>
              <option>Mode B (25 jours annuels)</option>
            </select>
          </label>
          <label className="text-sm">
            Arrondi
            <select className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm">
              <option>HALF_UP</option>
              <option>DOWN</option>
            </select>
          </label>
          <label className="text-sm">
            Max report (jours)
            <input className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm" defaultValue="5" />
          </label>
          <label className="text-sm">
            Expiration report (mois)
            <input className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm" defaultValue="12" />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button type="button" disabled>Persistance en cours d'activation</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
