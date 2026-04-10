import { Card, CardTitle } from "@/components/ui/card";

const teams = [
  { name: "Production", manager: "Sophie Martin", staffing: "82%" },
  { name: "R&D", manager: "Julien B", staffing: "91%" },
  { name: "Support", manager: "Lina R", staffing: "76%" }
];

export default function TeamsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Gestion équipes</h2>
        <p className="page-subtitle">Capacité, managers et règles de staffing.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.name}>
            <CardTitle>{team.name}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Manager: {team.manager}</p>
            <p className="mt-1 text-sm font-semibold">Disponibilité: {team.staffing}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
