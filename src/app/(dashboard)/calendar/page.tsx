import { Card, CardTitle } from "@/components/ui/card";

const views = ["Mois", "Semaine", "Équipe"] as const;

export default function CalendarPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Calendrier des absences</h2>
        <p className="page-subtitle">Vue consolidée pour pilotage staffing, blackout dates et capacité équipes.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {views.map((view) => (
          <Card key={view}>
            <CardTitle>Vue {view}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Filtrage multi-équipes, contraintes staffing et visualisation des absences validées.
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
